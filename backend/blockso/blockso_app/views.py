# std lib imports
from datetime import datetime, timedelta
import hashlib
import hmac
import json
import pytz
import secrets

# third party imports
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, \
    IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import generics, mixins, status, views
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
from web3 import Web3
import rq

# our imports
from .jobs import alchemy_jobs, covalent_jobs
from .models import Comment, CommentLike, Feed, Follow, Notification, Post, \
        PostLike, Profile, Socials
from . import pagination, redis_client, serializers


UserModel = get_user_model()


def get_expected_alchemy_sig(message):
    """
    Returns the value of message signed with settings.ALCHEMY_WH_SIGNING_KEY.
    """
    return hmac.new(
        bytes(settings.ALCHEMY_WH_SIGNING_KEY, "utf-8"),
        msg=bytes(message, "utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()


@api_view(['POST'])
def alchemy_notify_webhook(request):
    """
    Wehbook that receives a payload from Alchemy.
    Creates a job to process the payload, and puts it on a redis queue.
    Raises PermissionDenied if the signature in
    the request header does not match Alchemy's signing key.
    """
    # check request header containing alchemy's signature
    str_body = str(request.body, request.encoding or "utf-8")
    given_sig = request.headers["X-Alchemy-Signature"]
    expected_sig = get_expected_alchemy_sig(str_body)

    # raise PermissionDenied if signature is invalid
    if given_sig != expected_sig:
        raise PermissionDenied("bad signature")

    # queue job for processing the request payload
    queue = redis_client.RedisConnection().get_tx_processing_queue()
    queue.enqueue(
        alchemy_jobs.process_webhook_data,
        request.data
    )

    return Response(status=200)


@api_view(['GET'])
def auth_nonce(request):
    """
    Returns a nonce that should be used for login.
    Uses same logic as
    https://github.com/payton/django-siwe-auth/blob/main/siwe_auth/views.py
    """
    # delete all expired nonce's
    now = datetime.now(tz=pytz.UTC)
    Nonce.objects.filter(expiration__lte=datetime.now(tz=pytz.UTC)).delete()

    # create nonce, set it on the session, and return it to the user
    nonce = Nonce.objects.create(
        value=secrets.token_hex(12),
        expiration=now + timedelta(seconds=settings.AUTH_NONCE_AGE)
    )
    request.session["nonce"] = nonce.value

    return Response(status=200, data={"nonce": nonce.value})


@api_view(['POST'])
def auth_login(request):
    """
    Authenticates a user based on
    https://eips.ethereum.org/EIPS/eip-4361
    and https://github.com/payton/django-siwe-auth/blob/main/siwe_auth/views.py
    """
    # set request.body to play nicely with auth backend of
    # django-siwe-auth package
    request.body = json.dumps(request.data)

    # prepare data from the request for the authentication backend
    auth_kwargs = {
        "siwe_message": SiweMessage(
            message=request.data["message"]
        ),
        "signature": request.data["signature"]
    }

    # authenticate the user
    wallet = authenticate(request, **auth_kwargs)
    if wallet is not None:
        if wallet.is_active:
            # log user in
            login(request, wallet)

            # set chain_id on their session
            request.session["chain_id"] = auth_kwargs["siwe_message"].chain_id

            # create profile for user
            profile, _ = Profile.objects.get_or_create(
                user=wallet
            )
            Socials.objects.get_or_create(profile=profile)  # create socials

            return Response(status=200)
        else:
            return Response(status=401)

    return Response(status=403)


@api_view(['POST'])
def auth_logout(request):
    """ Terminates the user's session. """

    logout(request)
    return Response(status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_session(request):
    """
    Returns a 200 with JSON body of the authenticated user's
        - ethereum address
        - chain id
    Both of these are set on the session when the user authenticates.
    Returns a 403 if the user is not authenticated.
    """
    return Response(
        status=200,
        data={
            "address": request.user.ethereum_address,
            "chainId": int(request.session["chain_id"])
        }
    )


class FollowCreateDestroy(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView):

    """ View that supports following/unfollowing users. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.FollowSerializer

    def get_object(self):
        """
        Returns the object to be deleted.
        """
        # get the signed in user
        user = self.request.user
        user = user.profile

        # get address from the URL
        address = self.kwargs["address"]
        address = Web3.toChecksumAddress(address)
        target = Profile.objects.get(user_id=address)

        return Follow.objects.get(
            src=user,
            dest=target
        )

    def post(self, request, *args, **kwargs):
        """ Signed in user follows the given address. """

        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """ Signed in user unfollows the given address. """

        return self.destroy(request, *args, **kwargs)


class FollowersList(
    mixins.ListModelMixin,
    generics.GenericAPIView):

    """ View that supports listing the followers of a user. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.ProfileSerializer
    pagination_class = pagination.UserPagination

    def get_queryset(self):
        """
        Return Profiles that follow the address specified in the url.
        """
        # get profiles that follow the given address
        user = Profile.objects.get(user_id=self.kwargs["address"])
        follow_src = Follow.objects.filter(dest=user)
        followers = Profile.objects.filter(follow_src__in=follow_src)
        followers = followers.order_by("-follow_src")

        return followers

    def get(self, request, *args, **kwargs):
        """ List the users that follow the given address. """

        return self.list(request, *args, **kwargs)


class FollowingList(
    mixins.ListModelMixin,
    generics.GenericAPIView):

    """ View that supports listing the users that a user follows. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.ProfileSerializer
    pagination_class = pagination.UserPagination

    def get_queryset(self):
        """
        Return Profiles that are followed by the address specified in the url.
        """
        # get users that are followed by the given address
        user = Profile.objects.get(user_id=self.kwargs["address"])
        follow_dest = Follow.objects.filter(src=user)
        following = Profile.objects.filter(follow_dest__in=follow_dest)
        following = following.order_by("-follow_dest")

        return following

    def get(self, request, *args, **kwargs):
        """ List the users that the given address follows. """

        return self.list(request, *args, **kwargs)


class ProfileCreateRetrieveUpdate(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView):

    """ View that supports creating, retrieving, and updating Profiles. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.ProfileSerializer
    queryset = Profile.objects.all()
    lookup_url_kwarg = "address"
    lookup_field = "user"

    def get_object(self):
        """
        Returns the object the view is displaying.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        # gets the user that is being searched
        # or creates it if it does not exist
        address = Web3.toChecksumAddress(self.kwargs["address"])
        user, _ = UserModel.objects.get_or_create(
            ethereum_address=address
        )
        profile, _ = Profile.objects.get_or_create(user=user)

        return profile

    def post(self, request, *args, **kwargs):
        """ Create a Profile for the given address. """

        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """ Update a Profile for the given address. """

        return self.update(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """ Retrieve the Profile of the given address. """

        return self.retrieve(request, *args, **kwargs)


class UserList(
    mixins.ListModelMixin,
    generics.GenericAPIView):

    """ View that supports querying users. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.UserSerializer
    pagination_class = pagination.UserPagination

    def get_queryset(self):
        """
        Return queryset containing users starting with
        the given query.
        """
        # grab query param
        query = self.request.query_params.get("q", "")

        # grab first 20 results
        return UserModel.objects.filter(pk__startswith=query)[:20]

    def get(self, request, *args, **kwargs):
        """ Return a list of users matching the query. """

        return self.list(request, *args, **kwargs)


class UserRetrieve(
    mixins.RetrieveModelMixin,
    generics.GenericAPIView):

    """ View that supports retrieving logged in user. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.UserSerializer

    def get_object(self):
        """
        Returns the object representing the logged in user.
        Retrieves the logged in user from the session.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        return self.request.user

    def get(self, request, *args, **kwargs):
        """ Retrieve the logged in user. """

        return self.retrieve(request, *args, **kwargs)


class PostCreate(generics.CreateAPIView):

    """ View that supports creating a post by the authed user. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostSerializer


class PostList(generics.ListAPIView):

    """ View that supports listing Posts of an address. """

    serializer_class = serializers.PostSerializer
    pagination_class = pagination.PostsPagination

    def get_queryset(self):
        """
        Return queryset.
        """
        author = Profile.objects.get(user_id=self.kwargs["address"])
        queryset = Post.objects.filter(author=author)
        return queryset

    def get(self, request, *args, **kwargs):
        """
        Returns a list of the user's posts.
        """
        # clean the address
        self.kwargs["address"] = Web3.toChecksumAddress(self.kwargs["address"])
        address = self.kwargs["address"]

        # get the profile being searched or create it
        user, _ = UserModel.objects.get_or_create(
            ethereum_address=address
        )
        profile, _ = Profile.objects.get_or_create(user=user)

        # queue a job to fetch the profile's transaction history
        client = redis_client.RedisConnection()
        queue = client.get_high_queue()
        if address not in queue.get_job_ids() and \
           address not in rq.registry.FinishedJobRegistry(queue=queue):
            queue.enqueue(
                covalent_jobs.process_address_txs,
                address,
                100,
                job_id=address
            )

        return self.list(request, *args, **kwargs)


class PostRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):

    """ View that supports retrieving, updating, and deleting a Post. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.PostSerializer
    queryset = Post.objects.all()
    lookup_url_kwarg = "id"
    lookup_field = "id"

    def put(self, request, *args, **kwargs):
        """ Updates a Post with the given id. """

        instance = self.get_object()

        # return 403 if user does not own the Post
        if instance.author != request.user.profile:
            raise PermissionDenied("User does not own the Post.")

        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """ Deletes an object when a DELETE request is received. """

        instance = self.get_object()

        # return 403 if user does not own the Post
        if instance.author != request.user.profile:
            raise PermissionDenied("User does not own the Post.")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeCreateListDestroy(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin):

    """ View that supports creating, deleting, and listing Likes of a post. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.PostLikeSerializer
    pagination_class = pagination.LikesPagination

    def get_object(self):
        """
        Returns the object to be deleted.
        """
        # get the signed in user
        user = self.request.user.profile

        # get original post id from the URL
        post_id = self.kwargs["id"]

        return PostLike.objects.get(post_id=post_id, liker=user)

    def get_queryset(self):
        """
        Return the queryset of PostLike objects for the given post.
        The queryset is sorted from newest to oldest in the model class.
        """
        post_id = self.kwargs["id"]
        queryset = PostLike.objects.filter(post_id=post_id)

        return queryset

    def get(self, request, *args, **kwargs):

        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """ Signed in user likes a post. """

        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """ Signed in user unlikes a post. """

        return self.destroy(request, *args, **kwargs)


class CommentLikeCreateListDestroy(PostLikeCreateListDestroy):
    """
    View that supports creating, deleting,
    and listing Likes of a comment.
    """

    serializer_class = serializers.CommentLikeSerializer

    def get_object(self):
        """
        Returns the object to be deleted.
        """
        # get the signed in user
        user = self.request.user.profile

        # get original comment id from the URL
        post_id = self.kwargs["post_id"]
        comment_id = self.kwargs["comment_id"]

        return CommentLike.objects.get(
            comment__post__id=post_id,
            comment_id=comment_id,
            liker=user
        )

    def get_queryset(self):
        """
        Return the queryset of CommentLike objects for the given comment.
        The queryset is sorted from newest to oldest in the model class.
        """
        return CommentLike.objects.filter(
            comment__post__pk=self.kwargs["post_id"],
            pk=self.kwargs["comment_id"],
        )


class RepostDestroy(
    mixins.DestroyModelMixin,
    generics.GenericAPIView):

    """ View that supports deleting a repost of the post id in the url. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.RepostSerializer

    def get_object(self):
        """
        Returns the object to be deleted.
        """
        # get the signed in user
        user = self.request.user.profile

        # get original post id from the URL
        post_id = self.kwargs["id"]

        return Post.objects.get(
            author=user,
            refPost_id=post_id,
            isShare=True
        )

    def delete(self, request, *args, **kwargs):
        """ Signed in user deletes their repost of the given post. """

        return self.destroy(request, *args, **kwargs)


class ExploreList(views.APIView):
    """
    View that supports retrieving a list of feeds
    and profiles for the explore page.
    """

    def _get_feeds(self):
        """
        Return Feeds that are featured on the Explore page.
        The current implementation returns the latest 4 feeds.
        """
        queryset = Feed.objects.all().order_by("-id")[:4]

        return serializers.FeedSerializer(queryset, many=True).data

    def _get_profiles(self):
        """
        Return Profiles of users that are featured on the Explore page.
        The current implementation returns the top 8 profiles sorted
        from most followers to least followers.
        """
        queryset = Profile.objects.annotate(
            num_followers=Count('follow_dest')
        )
        queryset = queryset.order_by("-num_followers")
        queryset = queryset[:8]

        return serializers.ProfileSerializer(queryset, many=True).data

    def get(self, request, format=None):
        """
        Handle GET request.
        """
        feeds = self._get_feeds()
        profiles = self._get_profiles()
        body = {"feeds": feeds, "profiles": profiles}

        return Response(status=status.HTTP_200_OK, data=body)


class FeedRetrieve(generics.ListAPIView):

    """ View that supports retrieving a feed. """

    serializer_class = serializers.PostSerializer
    pagination_class = pagination.FeedPagination

    def get_queryset(self):
        """
        Return Posts of a Feed of activity for all the profiles in that feed.
        Sort the queryset in descending chronological order.
        """
        # get profiles of feed in question
        profiles = Feed.objects.get(pk=self.kwargs["id"]).profiles.all()

        # get all posts by those users
        queryset = Post.objects.filter(author__in=profiles)
        queryset = queryset.order_by("-created")

        return queryset


class MyFeedList(generics.ListAPIView):

    """ View that supports retrieving the feed of the logged in user. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostSerializer
    pagination_class = pagination.FeedPagination
    queryset = Post.objects.all()

    def get_queryset(self):
        """
        Return Posts of logged in user and all of the users that they follow.
        Sort the queryset in descending chronological order.
        """
        # get user
        user = self.request.user
        profile_queryset = Profile.objects.filter(
            user=user
        )
        # get users they follow
        follow_src = Follow.objects.filter(src=user.profile)
        profiles_followed = Profile.objects.filter(follow_dest__in=follow_src)

        # combine the two querysets
        profiles = profile_queryset | profiles_followed

        # get all posts by those users
        queryset = Post.objects.filter(author__in=profiles)
        queryset = queryset.order_by("-created")

        return queryset


class NotificationListUpdate(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView):

    """
    View that supports listing the notifications of an authenticated user,
    and marking a user's notifications as viewed.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.NotificationSerializer
    pagination_class = pagination.NotificationPagination

    def get_queryset(self):
        """
        Return Notifications of the authenticated user.
        The queryset is sorted from newest to oldest in the model class.
        """
        # get user
        user = self.request.user

        # get all notifications for the user
        queryset = Notification.objects.filter(user=user.profile)

        return queryset

    def get(self, request, *args, **kwargs):
        """ List the notifications of an authenticated user. """

        return self.list(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Updates the notifications of an authed user to be marked as viewed.
        User must own the notifications that are being updated.
        Returns updated notifications.
        """
        notif_ids = request.data["notifications"]
        user = request.user
        updated = []

        # mark all notifications as viewed
        for notif_id in notif_ids:
            notif = Notification.objects.get(id=notif_id)

            # return 403 if trying to update somebody else's notification
            if notif.user != user.profile:
                raise PermissionDenied("User does not own the Notification.")

            notif.viewed = True
            notif.save()
            updated.append(notif)

        serializer = serializers.NotificationSerializer(updated, many=True)
        return Response(serializer.data)


class CommentCreateList(generics.ListCreateAPIView):

    """ View that supports creating and listing Comments of a post. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.CommentSerializer
    pagination_class = pagination.CommentPagination


    def get_queryset(self):
        """
        Return Comments of the post specified in the url.
        """
        return Comment.objects.filter(post__pk=self.kwargs["post_id"])


class CommentRetrieve(generics.RetrieveAPIView):

    """ View that supports retrieving a Comment. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.CommentSerializer
    lookup_url_kwarg = "comment_id"
    lookup_field = "id"


    def get_queryset(self):
        """
        Return Comments of the post specified in the url.
        """
        return Comment.objects.filter(post__pk=self.kwargs["post_id"])

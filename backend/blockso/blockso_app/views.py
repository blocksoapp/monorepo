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
from rest_framework.exceptions import ParseError, PermissionDenied, \
    ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, \
    IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import generics, mixins, status, views
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
from web3 import Web3
import rq

# our imports
from .jobs import alchemy_jobs
from .models import Comment, CommentLike, Feed, Follow, Notification, Post, \
        PostLike, Profile, Socials
from . import alchemy, covalent, pagination, redis_client, serializers, utils


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
    request.data['message']['issued_at'] = request.data['message']['issuedAt']
    request.data['message']['chaind_id'] = request.data['message']['chainId']

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

            return Response(
                status=200,
                data=serializers.UserSerializer(request.user).data
            )
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
        covalent.enqueue_fetch_tx_history(profile)

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
        The current implementation returns the 4 most followed feeds.
        """
        queryset = Feed.objects.all()\
            .annotate(num_followers=Count('followers'))\
            .order_by("-num_followers")[:4]

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


class FeedCreateList(generics.ListCreateAPIView):
    
    """ View that supports listing feeds. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.FeedSerializer
    pagination_class = pagination.FeedPagination

    def get_queryset(self):
        """
        Return a queryset of Feeds, sorted by descending chronological order.
        """
        queryset = Feed.objects.all()\
            .order_by("-id")

        return queryset


class FeedRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):

    """ View that supports retrieving, updating, deleting a Feed. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.FeedSerializer
    queryset = Feed.objects.all()
    lookup_url_kwarg = "id"
    lookup_field = "id"

    def put(self, request, *args, **kwargs):
        """ Updates a Feed with the given id. """

        instance = self.get_object()

        # return 403 if user does not own the Feed
        if instance.owner != request.user.profile:
            raise PermissionDenied("User does not own the Feed.")

        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """ Deletes a Feed with the given id. """

        instance = self.get_object()

        # return 403 if user does not own the Feed
        if instance.owner != request.user.profile:
            raise PermissionDenied("User does not own the Feed.")

        self.perform_destroy(instance)

        return Response(status=status.HTTP_204_NO_CONTENT)


class FeedImageUpdateDestroy(
        mixins.DestroyModelMixin,
        mixins.UpdateModelMixin,
        generics.GenericAPIView):

    """ View that supports updating and deleting a Feed image. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.FeedImageSerializer
    parser_classes = [MultiPartParser]
    queryset = Feed.objects.all()
    lookup_url_kwarg = "id"
    lookup_field = "id"

    def delete(self, request, *args, **kwargs):
        """ Removes the Feed's image. """

        instance = self.get_object()

        # check permissions
        if instance.owner != request.user.profile:
            raise PermissionDenied("User does not own the feed.")

        instance.image.delete()

        return Response(status=204)

    def put(self, request, *args, **kwargs):
        """ Updates the Feed's image with the given image data. """

        file_obj = request.data["image"]
        instance = self.get_object()

        # check permissions
        if instance.owner != request.user.profile:
            raise PermissionDenied("User does not own the feed.")

        instance.image = file_obj
        instance.save()
        serializer = serializers.FeedImageSerializer(instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FeedsFollowedByMeList(generics.ListAPIView):
    """
    View that supports listing feeds followed by the authenticated user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.FeedSerializer
    pagination_class = pagination.FeedPagination

    def get_queryset(self):
        """
        Return a queryset of Feeds followed by the authenticated user,
        sorted by descending chronological order.
        """
        user = self.request.user.profile
        queryset = Feed.objects.filter(followers__in=[user]).order_by("-id")

        return queryset


class FeedFollowCreateDestroy(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView):

    """ View that supports following and unfollowing a Feed. """

    permission_classes = [IsAuthenticated]
    queryset = Feed.objects.all()
    lookup_url_kwarg = "id"
    lookup_field = "id"

    def delete(self, request, *args, **kwargs):
        """
        Remove the authenticated user from the Feed's followers.
        """
        # get the authenticated user
        user = self.request.user.profile

        # get the Feed
        feed = Feed.objects.get(pk=self.kwargs["id"])

        # remove the user from the Feed's followers
        feed.followers.remove(user)

        # return 204 No Content
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, *args, **kwargs):
        """ Signed in user follows the given Feed. """

        # get the authenticated user
        user = self.request.user.profile

        # get the Feed
        feed = Feed.objects.get(pk=self.kwargs["id"])

        # remove the user from the Feed's followers
        feed.followers.add(user)

        # return 201 CREATED
        return Response(status=status.HTTP_201_CREATED)


class FeedFollowersList(generics.ListAPIView):

    """ View that supports listing the followers of a Feed. """

    serializer_class = serializers.ProfileSerializer
    pagination_class = pagination.UserPagination

    def get_queryset(self):
        """
        Return Profiles that are followers of a Feed.
        Sorts the queryset in descending chronological order.
        """
        # get followers of feed in question
        queryset = Feed.objects.get(pk=self.kwargs["id"]).followers.all()
        queryset = queryset.order_by("-id")

        return queryset


class FeedFollowingCreateRetrieveDestroy(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView):

    """
    View that supports adding/removing/retrieving a profile to/from a Feed.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        """
        Remove the given user from the Feed's following.
        """
        # get the authenticated user
        user = self.request.user.profile

        # get the Feed
        feed = Feed.objects.get(pk=self.kwargs["id"])

        # make sure the user is the owner, or following is editable by pulic
        if (feed.owner != user and not feed.followingEditableByPublic):
            raise PermissionDenied(
                "User does not own feed and feed is not editable by public."
            )

        # remove the given profile from the Feed's following
        profile = Profile.objects.get(user_id=self.kwargs["address"])
        feed.following.remove(profile)

        # return 204 No Content
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get(self, request, *args, **kwargs):
        """ Retrieve whether the given user is in the Feed's following. """
    
        feed_id = self.kwargs["id"]
        address = Web3.toChecksumAddress(self.kwargs["address"])

        feed = Feed.objects.get(pk=feed_id)

        # feed is following given address
        if feed.following.filter(user_id=address).exists():
            return Response(status=status.HTTP_200_OK)

        # feed is not following given address
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        """ Add the given user to the Feed's following. """

        # get the authenticated user
        user = self.request.user.profile

        # get the Feed
        feed = Feed.objects.get(pk=self.kwargs["id"])

        # make sure the user is the owner, or following is editable by pulic
        if (feed.owner != user and not feed.followingEditableByPublic):
            raise PermissionDenied(
                "User does not own feed and feed is not editable by public."
            )

        # create the profile if needed
        try:
            address = Web3.toChecksumAddress(self.kwargs["address"])
        except ValueError: 
            raise ParseError("Invalid address.")

        profile_user, _ = UserModel.objects.get_or_create(pk=address)
        profile, _ = Profile.objects.get_or_create(user=profile_user)

        # queue a job to fetch the profile's transaction history
        covalent.enqueue_fetch_tx_history(profile)

        # add the given profile to the Feed's following
        feed.following.add(profile)

        # make a request to Alchemy to update the Notify webhook
        alchemy.update_notify_webhook()

        # return 201 CREATED
        serializer = serializers.ProfileSerializer(profile)
        return Response(status=status.HTTP_201_CREATED, data=serializer.data)


class FeedFollowingList(generics.ListAPIView):

    """ View that supports listing the following of a Feed. """

    serializer_class = serializers.ProfileSerializer
    pagination_class = pagination.UserPagination

    def get_queryset(self):
        """
        Return Profiles that a Feed is following.
        Sorts the queryset in descending chronological order.
        """
        # get following of feed in question
        queryset = Feed.objects.get(pk=self.kwargs["id"]).following.all()
        queryset = queryset.order_by("-id")

        return queryset


class FeedItemsList(generics.ListAPIView):

    """ View that supports listing a Feed's items. """

    serializer_class = serializers.PostSerializer
    pagination_class = pagination.FeedItemsPagination

    def get_queryset(self):
        """
        Return Posts of a Feed for all the profiles that Feed is following.
        Sort the queryset in descending chronological order.
        """
        # get profiles of feed in question
        profiles = Feed.objects.get(pk=self.kwargs["id"]).following.all()

        # get all posts by those users
        queryset = Post.objects.filter(author__in=profiles)
        queryset = queryset.order_by("-created")

        return queryset


class FeedsOwnedOrEditableList(generics.ListAPIView):
    """
    View that supports listing feeds that are owned by
    the authenticated user, or that are editable by public.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.FeedSerializer
    pagination_class = pagination.FeedPagination

    def get_queryset(self):
        """
        Return a queryset of Feeds followed by the authenticated user,
        sorted by descending chronological order.
        """
        user = self.request.user.profile
        owned = Feed.objects.filter(owner=user)
        editable = Feed.objects.filter(followingEditableByPublic=True)
        union = owned | editable

        return union


class MyFeedList(generics.ListAPIView):

    """ View that supports retrieving the feed of the logged in user. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostSerializer
    pagination_class = pagination.FeedItemsPagination
    queryset = Post.objects.all()

    def get_queryset(self):
        """
        Return Posts of logged in user and all of the users that they follow.
        Sort the queryset in descending chronological order.
        """
        # get user
        user = self.request.user
        profile = Profile.objects.filter(
            user=user
        )
        # get profiles the user follows
        follow_src = Follow.objects.filter(src=user.profile)
        profiles_followed = Profile.objects.filter(follow_dest__in=follow_src)

        # get profiles of feeds the user follows
        feeds = Feed.objects.filter(followers__in=profile)
        feed_profiles = Profile.objects.filter(feeds_following_them__in=feeds)

        # combine the three querysets
        profiles = profile | profiles_followed | feed_profiles

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

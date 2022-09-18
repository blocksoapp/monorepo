# std lib imports
from datetime import datetime, timedelta
import json
import pytz
import secrets

# third party imports
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, \
    IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import generics, mixins, status
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
from web3 import Web3

# our imports
from .models import Follow, Post, Profile
from . import jobs, serializers


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
            login(request, wallet)
            return Response(status=200)
        else:
            return Response(status=401)

    return Response(status=403)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auth_logout(request):
    """ Terminates the user's session. """

    logout(request)
    return Response(status=200)


class FollowCreateDestroy(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView):

    """ View that supports following/unfollowing users. """

    permission_classes = [IsAuthenticated]
    serializer_class = serializers.FollowSerializer
    queryset = Follow.objects.all()
    lookup_url_kwarg = "address"
    lookup_field = "dest"

    def post(self, request, *args, **kwargs):
        """ Signed in user follows the given address. """

        # fetch and store the tx history of the person being followed
        jobs.process_address_txs(self.kwargs["address"])

        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """ Signed in user unfollows the given address. """

        return self.destroy(request, *args, **kwargs)


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
        queryset = self.filter_queryset(self.get_queryset())

        # transform the address to checksum format since
        # that is how it is stored in the DB
        filter_kwargs = {
            "user": Web3.toChecksumAddress(self.kwargs["address"])
        }

        obj = generics.get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def post(self, request, *args, **kwargs):
        """ Create a Profile for the given address. """

        # fetch and store the tx history of the person being followed
        jobs.process_address_txs(self.kwargs["address"])

        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """ Update a Profile for the given address. """

        return self.update(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """ Retrieve the Profile of the given address. """

        return self.retrieve(request, *args, **kwargs)


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


class PostCreateList(generics.ListCreateAPIView):

    """ View that supports creating and listing Posts. """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.PostSerializer
    queryset = Post.objects.all()
    lookup_url_kwarg = "address"
    lookup_field = "author"


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
        if instance.author != request.user:
            raise PermissionDenied("User does not own the Post.")

        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """ Deletes an object when a DELETE request is received. """

        instance = self.get_object()

        # return 403 if user does not own the Post
        if instance.author != request.user:
            raise PermissionDenied("User does not own the Post.")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

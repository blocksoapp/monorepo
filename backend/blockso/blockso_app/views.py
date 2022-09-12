# std lib imports

# third party imports
from rest_framework import generics, mixins

# our imports
from .models import Profile
from . import serializers


class ProfileCreateRetrieveUpdate(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView):

    """ View that supports creating, retrieving, and updating Profiles. """

    serializer_class = serializers.ProfileSerializer
    queryset = Profile.objects.all()
    lookup_url_kwarg = "address"
    lookup_field = "user"

    def post(self, request, *args, **kwargs):
        """ Create a Profile for the given address. """

        return self.create(request, *args, **kwargs)

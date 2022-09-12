# std lib imports

# third party imports
from rest_framework import serializers

# our imports
from .models import Follow, Profile, Socials, User


class SocialsSerializer(serializers.ModelSerializer):
    """ Socials model serializer. """

    class Meta:
        model = Socials
        fields = ["website", "telegram", "discord", "twitter", "opensea",
                  "looksrare", "snapshot"]


class ProfileSerializer(serializers.ModelSerializer):
    """ Profile model serializer. """

    class Meta:
        model = Profile
        fields = ["address", "bio", "image", "socials", "numFollowers",
                  "numFollowing"]

    socials = SocialsSerializer()
    address = serializers.SerializerMethodField("get_address")
    numFollowers = serializers.SerializerMethodField("get_num_followers")
    numFollowing = serializers.SerializerMethodField("get_num_following")

    def get_address(self, obj):
        """ Returns the address of the User associated with the Profile. """

        user = getattr(obj, "user")
        return user.address

    def get_num_followers(self, obj):
        """ Returns the profile's follower count. """

        user = getattr(obj, "user")
        return Follow.objects.filter(dest=user).count()

    def get_num_following(self, obj):
        """ Returns the profile's following count. """

        user = getattr(obj, "user")
        return Follow.objects.filter(src=user).count()

    def create(self, validated_data):
        """ Creates a Profile. """

        # get address from the URL
        address = self.context.get("view").kwargs["address"].lower()
        
        # create User, Socials, Profile
        user = User.objects.create(address=address)
        socials = validated_data.pop("socials")
        profile = Profile.objects.create(user=user, **validated_data)
        socials = Socials.objects.create(profile=profile, **socials)

        return profile

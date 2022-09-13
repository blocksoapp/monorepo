# std lib imports

# third party imports
from rest_framework import serializers

# our imports
from .models import Follow, Post, Profile, Socials, User


class SocialsSerializer(serializers.ModelSerializer):
    """ Socials model serializer. """

    class Meta:
        model = Socials
        fields = ["website", "telegram", "discord", "twitter", "opensea",
                  "looksrare", "snapshot"]


class PostSerializer(serializers.ModelSerializer):
    """ Post model serializer. """

    class Meta:
        model = Post
        fields = ["author", "text", "imgUrl", "isShare", "isQuote",
                  "created", "refPost"]


class ProfileSerializer(serializers.ModelSerializer):
    """ Profile model serializer. """

    class Meta:
        model = Profile
        fields = ["address", "bio", "image", "socials", "numFollowers",
                  "numFollowing", "posts"]

    socials = SocialsSerializer()
    address = serializers.SerializerMethodField("get_address")
    numFollowers = serializers.SerializerMethodField("get_num_followers")
    numFollowing = serializers.SerializerMethodField("get_num_following")
    posts = serializers.SerializerMethodField("get_posts")

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

    def get_posts(self, obj):
        """
        Returns the profile's 20 most recent posts
        in descending chronological order.
        """
        user = getattr(obj, "user")
        posts = Post.objects.filter(author=user).order_by("-created")
        posts = posts[:20]
        return PostSerializer(posts, many=True).data

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

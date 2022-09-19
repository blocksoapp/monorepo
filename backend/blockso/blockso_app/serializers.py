# std lib imports

# third party imports
from django.contrib.auth import get_user_model
from rest_framework import serializers
from web3 import Web3

# our imports
from .models import Follow, Post, Profile, Socials


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
        return user.ethereum_address

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
        address = Web3.toChecksumAddress(address)
        
        # create User, Socials, Profile
        user_model = get_user_model()
        user, _ = user_model.objects.get_or_create(pk=address)
        socials = validated_data.pop("socials")
        profile = Profile.objects.create(user=user, **validated_data)
        socials = Socials.objects.create(profile=profile, **socials)

        return profile

    def update(self, instance, validated_data):
        """ Updates a Profile. """

        # update nested socials
        if "socials" in validated_data:
            socials_serializer = self.fields["socials"]
            socials_instance = instance.socials
            socials_data = validated_data.pop("socials")
            socials_serializer.update(socials_instance, socials_data)

        # update other attributes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # save the changes and return them
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    """ User model serializer. """

    class Meta:
        model = get_user_model()
        fields = ["address", "profile"]

    profile = ProfileSerializer()
    address = serializers.SerializerMethodField("get_address")

    def get_address(self, obj):
        """ Returns the address of the User. """

        return obj.ethereum_address


class FollowSerializer(serializers.ModelSerializer):
    """ Follow model serializer. """

    class Meta:
        model = Follow
        exclude = ["src", "dest"]


    def create(self, validated_data):
        """ Creates a Follow. """

        # get the signed in user
        user = self.context.get("request").user

        # get address from the URL
        address = self.context.get("view").kwargs["address"]
        address = Web3.toChecksumAddress(address)
        user_model = get_user_model()
        to_follow = user_model.objects.get(ethereum_address=address)
        
        # signed in user follows the address given in the url
        follow = Follow.objects.create(
            src=user,
            dest=to_follow
        )

        return follow

    def destroy(self, validated_data):
        """ Deletes a Follow. """

        # get the signed in user
        user = self.context.get("request").user

        # get address from the URL
        address = self.context.get("view").kwargs["address"]
        address = Web3.toChecksumAddress(address)
        
        # signed in user unfollows the address given in the url
        follow = Follow.objects.get(
            src_id=user.ethereum_address,
            dest_id=address
        )
        follow.delete()

        return None 


class PostSerializer(serializers.ModelSerializer):
    """ Post model serializer. """

    class Meta:
        model = Post
        fields = ["id", "author", "text", "imgUrl", "isShare", "isQuote",
                  "refPost", "refTx", "created"]
        read_only_fields = ["id", "author", "refPost", "refTx", "created"]

    def create(self, validated_data):
        """ Creates a Post. """

        # get user from the session
        author = self.context.get("request").user

        # TODO validate business logic like ref_post and ref_tx

        # create Post
        return Post.objects.create(author=author, **validated_data)

    def update(self, instance, validated_data):
        """ Updates a Post. """

        # update other attributes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # save the changes and return them
        instance.save()
        return instance

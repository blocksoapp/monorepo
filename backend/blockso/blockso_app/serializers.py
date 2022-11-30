# std lib imports
from datetime import datetime, timezone

# third party imports
from django.contrib.auth import get_user_model
from rest_framework import serializers
from web3 import Web3

# our imports
from .models import Comment, CommentOnPostEvent, ERC20Transfer, \
        ERC721Transfer, Follow, FollowedEvent, MentionedInCommentEvent, \
        MentionedInPostEvent, Notification, Post, Profile, Socials, Transaction


UserModel = get_user_model()


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
                  "numFollowing", "followedByMe"]

    socials = SocialsSerializer()
    address = serializers.SerializerMethodField("get_address")
    numFollowers = serializers.SerializerMethodField("get_num_followers")
    numFollowing = serializers.SerializerMethodField("get_num_following")
    followedByMe = serializers.SerializerMethodField("get_followed_by_me")

    def get_address(self, obj):
        """ Returns the address of the User associated with the Profile. """

        user = getattr(obj, "user")
        return user.ethereum_address

    def get_num_followers(self, obj):
        """ Returns the profile's follower count. """

        followers = obj.follow_dest.all()
        return followers.count() 

    def get_num_following(self, obj):
        """ Returns the profile's following count. """

        following = obj.follow_src.all()
        return following.count() 

    def get_followed_by_me(self, obj):
        """ Returns whether the profile is being followed by the requestor. """

        # handle using serializer outside of a request
        request = self.context.get("request")
        if request is None:
            return None

        # get authed user
        authed_user = request.user
        authed_user = getattr(authed_user, "profile", None)

        # check if authed user follows the profile
        return Follow.objects.filter(src=authed_user, dest=obj).exists()

    def create(self, validated_data):
        """ Creates a Profile. """

        # get address from the URL
        address = self.context.get("view").kwargs["address"].lower()
        address = Web3.toChecksumAddress(address)
        
        # create User, Socials, Profile
        user, _ = UserModel.objects.get_or_create(pk=address)
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
        model = UserModel
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
        user = user.profile

        # get address from the URL
        address = self.context.get("view").kwargs["address"]
        address = Web3.toChecksumAddress(address)
        to_follow = Profile.objects.get(user_id=address)

        # signed in user follows the address given in the url
        follow = Follow.objects.create(
            src=user,
            dest=to_follow
        )

        # notify the user that was followed
        notif = Notification.objects.create(user=to_follow)
        FollowedEvent.objects.create(
            notification=notif,
            follow=follow,
            followed_by=user
        )

        return follow


class ERC20TransferSerializer(serializers.ModelSerializer):
    """ ERC20Transfer model serializer. """

    class Meta:
        model = ERC20Transfer
        fields = ["contract_address", "contract_name", "contract_ticker",
                  "logo_url", "from_address", "to_address", "amount",
                  "decimals"]
        read_only_fields = fields


class ERC721TransferSerializer(serializers.ModelSerializer):
    """ ERC721Transfer model serializer. """

    class Meta:
        model = ERC721Transfer
        fields = ["contract_address", "contract_name", "contract_ticker",
                  "logo_url", "from_address", "to_address", "token_id"]
        read_only_fields = fields


class TransactionSerializer(serializers.ModelSerializer):
    """ Transaction model serializer. """

    class Meta:
        model = Transaction
        fields = ["chain_id", "tx_hash", "block_signed_at", "tx_offset",
                  "successful", "from_address", "to_address", "value",
                  "erc20_transfers", "erc721_transfers"]
        read_only_fields = fields

    erc20_transfers = serializers.SerializerMethodField()
    erc721_transfers = serializers.SerializerMethodField()

    def get_erc20_transfers(self, instance):
        """
        Return a list serializer of all the ERC20 transfers
        associated with the transaction.
        """
        transfers = instance.erc20_transfers.all()
        return ERC20TransferSerializer(transfers, many=True).data

    def get_erc721_transfers(self, instance):
        """
        Return a list serializer of all the ERC721 transfers
        associated with the transaction.
        """
        transfers = instance.erc721_transfers.all()
        return ERC721TransferSerializer(transfers, many=True).data


class TaggedUsersField(serializers.RelatedField):
    """
    Serializes / de-serializes the tagged
    users field that is used for comments/posts.
    """

    def to_internal_value(self, data):
        """ Does deserialization, for writing. """

        # return profile representing the tagged user
        address = Web3.toChecksumAddress(data)
        return Profile.objects.get(user_id=address)

    def to_representation(self, value):
        """ Does serialization, for reading. """

        return ProfileSerializer(value).data


class RefPostField(serializers.RelatedField):
    """
    Serializes / de-serializes the ref post
    field that is used for reposts / quote posts.
    """

    def to_internal_value(self, data):
        """ Does deserialization, for writing. """

        # return the referenced post
        return Post.objects.get(pk=data)

    def to_representation(self, value):
        """ Does serialization, for reading. """

        # pass context through to nested serializer
        serializer_context = {'request': self.context.get('request')}

        return PostSerializer(value, context=serializer_context).data


class PostSerializer(serializers.ModelSerializer):
    """ Post model serializer. """

    class Meta:
        model = Post
        fields = ["id", "author", "text", "imgUrl", "isShare", "isQuote",
                  "refPost", "refTx", "numComments", "created", "tagged_users",
                  "numReposts", "repostedByMe"]
        read_only_fields = ["id", "author", "refTx", "numComments", "created",
                            "numReposts", "repostedByMe"]

    author = ProfileSerializer(required=False)
    refTx = serializers.SerializerMethodField()
    numComments = serializers.SerializerMethodField()
    numReposts = serializers.SerializerMethodField()
    repostedByMe = serializers.SerializerMethodField()
    refPost = RefPostField(
        allow_null=True,
        queryset=Post.objects.all()
    )
    tagged_users = TaggedUsersField(
        many=True,
        queryset=Profile.objects.all()
    )

    def get_refTx(self, instance):
        """ Return serialized transaction that the post refers to. """

        if instance.refTx is not None:
            return TransactionSerializer(
                Transaction.objects.get(pk=instance.refTx.id)
            ).data

        return None

    def get_numComments(self, instance):
        """ Returns number of comments on the post. """

        return instance.comments.count()

    def get_numReposts(self, instance):
        """ Returns number of reposts for the post. """

        return Post.objects.filter(refPost=instance).count()

    def get_repostedByMe(self, instance):
        """ Returns whether the post has been reposted by the authed user. """

        # handle using serializer outside of a request
        request = self.context.get("request")
        if request is None:
            return False

        return Post.objects.filter(
            refPost_id=instance.id,
            isShare=True,
            author=request.user.profile
        ).exists()

    def _handle_repost(self, author, created, ref_post):
        """
        Creates a repost and notifies the appropriate parties.
        Returns the created repost.
        """
        # do not allow user to repost their own post
        if Post.objects.filter(pk=ref_post.id, author=author).exists():
            raise serializers.ValidationError("Cannot repost own post.")

        # do not allow user to repost an item twice
        if Post.objects.filter(refPost=ref_post, author=author).exists():
            raise serializers.ValidationError("Cannot repost an item twice.")

        # do not allow user to repost a repost
        if ref_post.refPost is not None and ref_post.isQuote is False:
            raise serializers.ValidationError("Cannot repost a repost.")

        post = Post.objects.create(
            author=author,
            created=created,
            refPost=ref_post,
            isShare=True,
            isQuote=False,
            refTx=None
        )

        # TODO handle notification that someone reposted your post

        return post

    def create(self, validated_data):
        """ Creates a Post. """

        # get user from the session
        author = self.context.get("request").user.profile
        created = datetime.now(timezone.utc)
        ref_post = validated_data.pop("refPost")

        # handle reposts
        if ref_post is not None and \
            validated_data["isShare"] is True:

            return self._handle_repost(
                author,
                created,
                ref_post
            )

        # TODO validate business logic like isQuote and refTx

        # extract any tagged users
        tagged_users = validated_data.pop("tagged_users")

        # create Post
        post = Post.objects.create(
            author=author,
            created=created,
            **validated_data
        )

        # set tagged users
        post.tagged_users.set(tagged_users)
        post.save()

        # create a notifications for the tagged users
        for profile in tagged_users:
            notif = Notification.objects.create(user=profile)
            MentionedInPostEvent.objects.create(
                notification=notif,
                post=post,
                mentioned_by=author
            )

        return post

    def update(self, instance, validated_data):
        """ Updates a Post. """

        # extract any tagged users
        tagged_users = validated_data.pop("tagged_users")

        # update other attributes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # set tagged users
        instance.tagged_users.set(tagged_users)

        # create a notifications for the tagged users
        for profile in tagged_users:
            notif = Notification.objects.create(user=profile)
            MentionedInPostEvent.objects.create(
                notification=notif,
                post=instance,
                mentioned_by=instance.author
            )

        # save the changes and return them
        instance.save()
        return instance


class RepostSerializer(serializers.ModelSerializer):
    """ Repost model serializer. """

    class Meta:
        model = Post


class CommentSerializer(serializers.ModelSerializer):
    """ Comment model serializer. """

    class Meta:
        model = Comment
        fields = ["id", "author", "post", "text", "tagged_users", "created"]
        read_only_fields = ["id", "author", "created", "post"]


    author = ProfileSerializer(required=False)
    tagged_users = TaggedUsersField(
        many=True,
        queryset=Profile.objects.all()
    )


    def create(self, validated_data):
        """ Creates a Comment. """

        # get user from the session
        author = self.context.get("request").user.profile

        # get post id from the url
        post = Post.objects.get(
            pk=self.context.get("view").kwargs["post_id"]
        )

        # extract any tagged users
        tagged_users = validated_data.pop("tagged_users")

        # create Comment
        comment = Comment.objects.create(
            author=author,
            post=post,
            **validated_data
        )

        comment.tagged_users.set(tagged_users)
        comment.save()

        # create a notification for the post author
        notif = Notification.objects.create(user=post.author)
        CommentOnPostEvent.objects.create(
            notification=notif,
            comment=comment,
            post=post,
            commentor=author
        )

        # create a notifications for the tagged users
        for profile in tagged_users:
            notif = Notification.objects.create(user=profile)
            MentionedInCommentEvent.objects.create(
                notification=notif,
                comment=comment,
                mentioned_by=author
            )

        return comment


class MentionedInPostEventSerializer(serializers.ModelSerializer):
    """ MentionedInPostEvent model serializer. """

    class Meta:
        model = MentionedInPostEvent
        fields = ["post", "created", "mentionedBy"]
        read_only_fields = fields

    mentionedBy = serializers.SerializerMethodField("get_mentioned_by")

    def get_mentioned_by(self, obj):
        """ Returns the user that did the mentioning. """

        return ProfileSerializer(obj.mentioned_by).data


class MentionedInCommentEventSerializer(serializers.ModelSerializer):
    """ MentionedInCommentEvent model serializer. """

    class Meta:
        model = MentionedInCommentEvent
        fields = ["comment", "created", "mentionedBy", "post"]
        read_only_fields = fields

    mentionedBy = serializers.SerializerMethodField("get_mentioned_by")
    post = serializers.SerializerMethodField("get_post")


    def get_mentioned_by(self, obj):
        """ Returns the user that did the mentioning. """

        return ProfileSerializer(obj.mentioned_by).data

    def get_post(self, obj):
        """ Returns the post id associated with the comment. """

        return obj.comment.post_id


class CommentOnPostEventSerializer(serializers.ModelSerializer):
    """ CommentOnPostEvent model serializer. """

    class Meta:
        model = CommentOnPostEvent
        fields = ["comment", "commentor", "created", "post"]
        read_only_fields = fields

    commentor = ProfileSerializer()


class FollowedEventSerializer(serializers.ModelSerializer):
    """ FollowedEvent model serializer. """

    class Meta:
        model = FollowedEvent
        fields = ["followedBy", "created"]
        read_only_fields = fields

    followedBy = serializers.SerializerMethodField("get_followed_by")


    def get_followed_by(self, obj):
        """ Returns the user that did the following. """

        return ProfileSerializer(obj.followed_by).data


class NotificationSerializer(serializers.ModelSerializer):
    """ Notification model serializer. """

    class Meta:
        model = Notification
        fields = ["id", "created", "events", "viewed"]
        read_only_fields = fields

    events = serializers.SerializerMethodField("get_events")


    def get_events(self, obj):
        """ Returns the events associated with the notification. """

        events = {}
        events["mentionedInPostEvent"] = self.\
            get_mentioned_in_post_event(obj)
        events["mentionedInCommentEvent"] = self.\
            get_mentioned_in_comment_event(obj)
        events["commentOnPostEvent"] = self.get_comment_on_post_event(obj)
        events["followedEvent"] = self.get_followed_event(obj)

        return events

    def get_comment_on_post_event(self, obj):
        """
        Returns the CommentOnPostEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "comment_on_post_event"):
            return None

        return CommentOnPostEventSerializer(
            obj.comment_on_post_event
        ).data

    def get_mentioned_in_post_event(self, obj):
        """
        Returns the MentionedInPostEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "mentioned_in_post_event"):
            return None

        return MentionedInPostEventSerializer(
            obj.mentioned_in_post_event
        ).data

    def get_mentioned_in_comment_event(self, obj):
        """
        Returns the MentionedInCommentEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "mentioned_in_comment_event"):
            return None

        return MentionedInCommentEventSerializer(
            obj.mentioned_in_comment_event
        ).data

    def get_followed_event(self, obj):
        """
        Returns the FollowedEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "followed_event"):
            return None

        return FollowedEventSerializer(
            obj.followed_event
        ).data

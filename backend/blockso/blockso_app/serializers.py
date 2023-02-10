# std lib imports
from datetime import datetime, timezone

# third party imports
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework.fields import ModelField
from rest_framework import serializers
from web3 import Web3

# our imports
from .models import Comment, CommentLike, CommentOnPostEvent, ERC20Transfer, \
        ERC721Transfer, Feed, Follow, FollowedEvent, LikedCommentEvent, \
        LikedPostEvent, MentionedInCommentEvent, MentionedInPostEvent, \
        Notification, Post, PostLike, Profile, RepostEvent, Socials, \
        Transaction
from . import alchemy


UserModel = get_user_model()
TaggedEveryone = "everyone"


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
                  "numFollowing", "followedByMe", "lastLogin"]

    socials = SocialsSerializer()
    address = serializers.SerializerMethodField("get_address")
    numFollowers = serializers.SerializerMethodField("get_num_followers")
    numFollowing = serializers.SerializerMethodField("get_num_following")
    followedByMe = serializers.SerializerMethodField("get_followed_by_me")
    lastLogin = serializers.SerializerMethodField("get_last_login")

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
        if authed_user is None:
            return False

        # check if authed user follows the profile
        return Follow.objects.filter(src=authed_user, dest=obj).exists()

    def get_last_login(self, obj):
        """ Returns the profile's last login datetime. """

        return obj.user.last_login

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

        # make a request to Alchemy to update the Notify webhook
        alchemy.update_notify_webhook()

        return follow


class FeedImageSerializer(serializers.Serializer):
    """ Feed image serializer. """

    class Meta:
        fields = ["image"]

    image = serializers.FileField()


class FeedSerializer(serializers.ModelSerializer):
    """ Feed model serializer. """

    class Meta:
        model = Feed
        fields = [
            "id", "name", "description", "image", "owner",
            "followingEditableByPublic", "followedByMe",
            "numFollowing", "numFollowers"
        ]
        read_only_fields = [
            "id", "owner", "image", "followedByMe", "numFollowers", "numFollowing"
        ]

    owner = ProfileSerializer(required=False)
    numFollowers = serializers.SerializerMethodField("get_num_followers")
    numFollowing = serializers.SerializerMethodField("get_num_following")
    followedByMe = serializers.SerializerMethodField("get_followed_by_me")

    def get_num_followers(self, obj):
        """ Returns the Feed's follower count. """

        return obj.followers.all().count()

    def get_num_following(self, obj):
        """ Returns the Feed's following count. """

        return obj.following.all().count()

    def get_followed_by_me(self, obj):
        """ Returns whether the Feed is followed by the requestor. """

        # handle using serializer outside of a request
        request = self.context.get("request")
        if request is None:
            return None

        # get authed user
        authed_user = request.user
        authed_user = getattr(authed_user, "profile", None)
        if authed_user is None:
            return False

        # check if authed user follows the Feed
        return obj.followers.filter(pk=authed_user.id).exists()

    def create(self, validated_data):
        """ Creates a Feed. """

        # get user from the session
        owner = self.context.get("request").user.profile

        # create Feed
        feed = Feed.objects.create(
            owner=owner,
            **validated_data
        )
        feed.followers.add(owner)

        return feed


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
        fields = ["chain_id", "tx_hash", "block_signed_at", "from_address",
                "to_address", "value", "erc20_transfers", "erc721_transfers"]
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

        if data.lower() == TaggedEveryone:
            return TaggedEveryone

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
                  "numReposts", "repostedByMe", "numLikes", "likedByMe"]
        read_only_fields = ["id", "author", "refTx", "numComments", "created",
                            "numReposts", "repostedByMe", "numLikes", "likedByMe"]

    author = ProfileSerializer(required=False)
    refTx = serializers.SerializerMethodField()
    numComments = serializers.SerializerMethodField()
    numLikes = serializers.SerializerMethodField()
    likedByMe = serializers.SerializerMethodField()
    numReposts = serializers.SerializerMethodField()
    repostedByMe = serializers.SerializerMethodField()
    refPost = RefPostField(
        allow_null=True,
        queryset=Post.objects.all()
    )
    tagged_users = TaggedUsersField(
        many=True,
        queryset=Profile.objects.all(),
        write_only=True
    )

    def get_refTx(self, instance):
        """ Return serialized transaction that the post refers to. """

        if instance.refTx is not None:
            return TransactionSerializer(
                Transaction.objects.get(pk=instance.refTx.id)
            ).data

        return None

    def get_numLikes(self, instance):
        """ Returns number of likes on the post. """

        return instance.likes.count()

    def get_likedByMe(self, instance):
        """ Returns whether the authenticated user liked the post. """

        # handle using serializer outside of a request
        request = self.context.get("request")
        if request is None:
            return False

        # handle anonymous users, i.e. not signed in
        if isinstance(request.user, AnonymousUser):
            return False

        user = request.user.profile
        return instance.likes.filter(liker=user).exists()

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

        # handle anonymous users, i.e. not signed in
        if isinstance(request.user, AnonymousUser):
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

        # notify the original post author about the repost
        notif = Notification.objects.create(user=ref_post.author)
        RepostEvent.objects.create(
            notification=notif,
            repost=post,
            reposted_by=author
        )

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
        # if everyone is tagged then tag all active users minus post author
        if TaggedEveryone in tagged_users:
            tagged_users = Profile.objects.all()\
                .exclude(user__last_login=None)\
                .exclude(id=author.id)

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

        # if everyone is tagged then tag all active users minus post author
        if TaggedEveryone in tagged_users:
            tagged_users = Profile.objects.all()\
                .exclude(user__last_login=None)\
                .exclude(id=author.id)

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


class PostLikeSerializer(serializers.ModelSerializer):
    """ PostLike model serializer. """

    class Meta:
        model = PostLike
        fields = ["liker", "post"]
        read_only_fields = fields

    liker = ProfileSerializer(required=False)

    def create(self, validated_data):
        """ Likes a post. """

        # get the signed in user
        user = self.context.get("request").user
        user = user.profile

        # get post id from the URL
        post_id = self.context.get("view").kwargs["id"]
        post = Post.objects.get(pk=post_id)

        # create post like
        like, created = PostLike.objects.get_or_create(
            liker=user,
            post=post
        )

        # raise 400 if user tried to like the same post twice
        if created is False:
            raise serializers.ValidationError("Cannot like a post twice.")

        # notify the post author that the user liked their post
        notif = Notification.objects.create(user=post.author)
        LikedPostEvent.objects.create(
            notification=notif,
            post=post,
            liked_by=user
        )

        return like


class RepostSerializer(serializers.ModelSerializer):
    """ Repost model serializer. """

    class Meta:
        model = Post


class CommentSerializer(serializers.ModelSerializer):
    """ Comment model serializer. """

    class Meta:
        model = Comment
        fields = ["id", "author", "post", "text", "tagged_users", "created",
                  "numLikes", "likedByMe"]
        read_only_fields = ["id", "author", "created", "post", "numLikes",
                            "likedByMe"]


    author = ProfileSerializer(required=False)
    tagged_users = TaggedUsersField(
        many=True,
        queryset=Profile.objects.all(),
        write_only=True
    )
    numLikes = serializers.SerializerMethodField()
    likedByMe = serializers.SerializerMethodField()


    def get_numLikes(self, instance):
        """ Returns number of likes on the comment. """

        return instance.likes.count()

    def get_likedByMe(self, instance):
        """ Returns whether the authenticated user liked the comment. """

        # handle using serializer outside of a request
        request = self.context.get("request")
        if request is None:
            return False

        # handle anonymous users, i.e. not signed in
        if isinstance(request.user, AnonymousUser):
            return False

        user = request.user.profile
        return instance.likes.filter(liker=user).exists()

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

        # if everyone is tagged then tag all active users minus comment author
        if TaggedEveryone in tagged_users:
            tagged_users = Profile.objects.all()\
                .exclude(user__last_login=None)\
                .exclude(id=author.id)

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


class CommentLikeSerializer(serializers.ModelSerializer):
    """ CommentLike model serializer. """

    class Meta:
        model = CommentLike
        fields = ["liker", "comment"]
        read_only_fields = fields

    liker = ProfileSerializer(required=False)

    def create(self, validated_data):
        """ Likes a comment. """

        # get the signed in user
        user = self.context.get("request").user
        user = user.profile

        # get comment id from the URL
        comment_id = self.context.get("view").kwargs["comment_id"]
        comment = Comment.objects.get(pk=comment_id)

        # create comment like
        like, created = CommentLike.objects.get_or_create(
            liker=user,
            comment=comment
        )

        # raise 400 if user tried to like the same comment twice
        if created is False:
            raise serializers.ValidationError("Cannot like a comment twice.")

        # notify the comment author that the user liked their comment
        notif = Notification.objects.create(user=comment.author)
        LikedCommentEvent.objects.create(
            notification=notif,
            comment=comment,
            liked_by=user
        )

        return like


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


class LikedCommentEventSerializer(serializers.ModelSerializer):
    """ LikedCommentEvent model serializer. """

    class Meta:
        model = LikedCommentEvent
        fields = ["comment", "post", "likedBy", "created"]
        read_only_fields = fields

    likedBy = serializers.SerializerMethodField("get_liked_by")
    post = serializers.SerializerMethodField("get_post")


    def get_liked_by(self, obj):
        """ Returns the user that did the liking. """

        return ProfileSerializer(obj.liked_by).data

    def get_post(self, obj):
        """ Returns the post of the comment that was liked. """

        return obj.comment.post.id


class LikedPostEventSerializer(serializers.ModelSerializer):
    """ LikedPostEvent model serializer. """

    class Meta:
        model = LikedPostEvent
        fields = ["post", "likedBy", "created"]
        read_only_fields = fields

    likedBy = serializers.SerializerMethodField("get_liked_by")

    def get_liked_by(self, obj):
        """ Returns the user that did the liking. """

        return ProfileSerializer(obj.liked_by).data


class RepostEventSerializer(serializers.ModelSerializer):
    """ RepostEvent model serializer. """

    class Meta:
        model = RepostEvent
        fields = ["repostedBy", "repost", "created"]
        read_only_fields = fields

    repostedBy = serializers.SerializerMethodField("get_reposted_by")

    def get_reposted_by(self, obj):
        """ Returns the user that did the reposting. """

        return ProfileSerializer(obj.reposted_by).data


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
        events["repostEvent"] = self.get_repost_event(obj)
        events["likedPostEvent"] = self.get_liked_post_event(obj)
        events["likedCommentEvent"] = self.get_liked_comment_event(obj)

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

    def get_liked_post_event(self, obj):
        """
        Returns the LikedPostEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "liked_post_event"):
            return None

        return LikedPostEventSerializer(
            obj.liked_post_event
        ).data

    def get_liked_comment_event(self, obj):
        """
        Returns the LikedCommentEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "liked_comment_event"):
            return None

        return LikedCommentEventSerializer(
            obj.liked_comment_event
        ).data

    def get_repost_event(self, obj):
        """
        Returns the RepostEvent associated
        with the notification.
        """
        # return None if the notification does not have this event
        if not hasattr(obj, "repost_event"):
            return None

        return RepostEventSerializer(
            obj.repost_event
        ).data

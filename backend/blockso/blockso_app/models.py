# std lib imports

# third party imports
from django.db import models
from django.conf import settings

# our imports


class Profile(models.Model):
    """ Represents the profile of a user. """

    user = models.OneToOneField(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    bio = models.TextField(blank=True, default="")
    image = models.URLField(blank=True, default="")


class Socials(models.Model):
    """ Represents the external social media accounts of a user. """
    
    profile = models.OneToOneField(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="socials"
    )
    website = models.URLField(blank=True)
    telegram = models.URLField(blank=True)
    discord = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    opensea = models.URLField(blank=True)
    looksrare = models.URLField(blank=True)
    snapshot = models.URLField(blank=True)


class Follow(models.Model):
    """ Represents the follower-followed relationship between users. """

    src = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="follow_src"
    )
    dest = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="follow_dest"
    )

    class Meta:
        constraints = [
            # user cannot follow someone twice
            models.UniqueConstraint(
                fields=['src', 'dest'],
                name='cannot follow twice constraint'
            ),
            # user cannot follow themselves
            models.CheckConstraint(
                check=~models.Q(src__exact=models.F("dest")),
                name="cannot follow oneself constraint"
            ),
        ]


class Transaction(models.Model):
    """ Represents a blockchain Transaction. """

    chain_id = models.PositiveSmallIntegerField(blank=False)
    tx_hash = models.CharField(max_length=255, blank=False) 
    block_signed_at = models.DateTimeField(blank=False)
    tx_offset = models.PositiveSmallIntegerField(blank=False)
    successful = models.BooleanField(blank=False)
    from_address = models.CharField(max_length=255, blank=False)
    to_address = models.CharField(max_length=255, blank=False)
    value = models.CharField(max_length=255, blank=False)


class ERC20Transfer(models.Model):
    """ Represents an ERC20 transfer. """

    tx = models.ForeignKey(
        to=Transaction,
        on_delete=models.CASCADE,
        related_name="erc20_transfers",
        blank=False
    )
    contract_address = models.CharField(max_length=255, blank=False)
    contract_name = models.CharField(max_length=255, blank=False)
    contract_ticker = models.CharField(max_length=255, blank=False)
    logo_url = models.URLField(blank=False)
    from_address = models.CharField(max_length=255, blank=False)
    to_address = models.CharField(max_length=255, blank=False)
    amount = models.CharField(max_length=255, blank=False)
    decimals = models.PositiveSmallIntegerField(blank=False)


class ERC721Transfer(models.Model):
    """ Represents an ERC721 transfer. """

    tx = models.ForeignKey(
        to=Transaction,
        on_delete=models.CASCADE,
        related_name="erc721_transfers",
        blank=False
    )
    contract_address = models.CharField(max_length=255, blank=False)
    contract_name = models.CharField(max_length=255, blank=False)
    contract_ticker = models.CharField(max_length=255, blank=False)
    logo_url = models.URLField(blank=False)
    from_address = models.CharField(max_length=255, blank=False)
    to_address = models.CharField(max_length=255, blank=False)
    token_id = models.CharField(max_length=255, blank=False)


class Post(models.Model):
    """ Represents a Post created by a user. """

    class Meta:
        ordering = ["-created"]


    author = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="posts"
    )
    text = models.TextField(blank=True)
    tagged_users = models.ManyToManyField(
        to=Profile,
        blank=True
    )
    imgUrl = models.URLField(blank=True)
    isShare = models.BooleanField(blank=False)
    isQuote = models.BooleanField(blank=False)
    refPost = models.ForeignKey(
        to="self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    refTx = models.ForeignKey(
        to=Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=False
    )
    created = models.DateTimeField(blank=False)


class PostLike(models.Model):
    """ Represents a Like for a Post. """

    class Meta:
        ordering = ["-created"]


    post = models.ForeignKey(
        to=Post,
        on_delete=models.CASCADE,
        related_name="likes"
    )
    liker = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="post_likes"
    )
    created = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    """ Represents a Comment created by a user. """

    class Meta:
        ordering = ["-created"]

    
    author = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    post = models.ForeignKey(
        to=Post,
        on_delete=models.SET_NULL,
        null=True,
        related_name="comments"
    )
    text = models.TextField(blank=False)
    tagged_users = models.ManyToManyField(
        to=Profile,
        blank=True
    )
    created = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    """ Represents a Notification created for a user. """

    class Meta:
        ordering = ["-created"]

    
    user = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    created = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)


class MentionedInPostEvent(models.Model):
    """ An event respresenting when a user is mentioned in a post. """

    notification = models.OneToOneField(
        to=Notification,
        related_name="mentioned_in_post_event",
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        to=Post,
        on_delete=models.CASCADE
    )
    mentioned_by = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)


class MentionedInCommentEvent(models.Model):
    """ An event respresenting when a user is mentioned in a comment. """

    notification = models.OneToOneField(
        to=Notification,
        related_name="mentioned_in_comment_event",
        on_delete=models.CASCADE
    )
    comment = models.ForeignKey(
        to=Comment,
        on_delete=models.CASCADE
    )
    mentioned_by = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)


class CommentOnPostEvent(models.Model):
    """ An event respresenting when someone comments on a user's post. """

    notification = models.OneToOneField(
        to=Notification,
        related_name="comment_on_post_event",
        on_delete=models.CASCADE
    )
    comment = models.ForeignKey(
        to=Comment,
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        to=Post,
        on_delete=models.CASCADE
    )
    commentor = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)


class FollowedEvent(models.Model):
    """ An event respresenting when a user is followed by another. """

    notification = models.OneToOneField(
        to=Notification,
        related_name="followed_event",
        on_delete=models.CASCADE
    )
    follow = models.ForeignKey(
        to=Follow,
        on_delete=models.CASCADE
    )
    followed_by = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)


class LikedPostEvent(models.Model):
    """ An event respresenting when a user likes another user's post. """

    notification = models.OneToOneField(
        to=Notification,
        related_name="liked_post_event",
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        to=Post,
        on_delete=models.CASCADE
    )
    liked_by = models.ForeignKey(
        to=Profile,
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)

# std lib imports

# third party imports
from django.db import models
from django.conf import settings

# our imports


class User(models.Model):
    """ Represents a user. """

    address = models.CharField(
        primary_key=True,
        max_length=255,
        blank=False,
        editable=False
    )

    def clean(self, *args, **kwargs):
        """ Clean model before storing it. """

        # make address lowercase
        self.address = self.address.lower() 

    def save(self, *args, **kwargs):
        """ Business logic on write. """

        # run the clean and validation functions
        self.full_clean()
        super().save(*args, **kwargs)


class Profile(models.Model):
    """ Represents the profile of a user. """

    user = models.OneToOneField(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    bio = models.TextField(blank=False)
    image = models.URLField(blank=False)


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
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="follow_src"
    )
    dest = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
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
    token_id = models.PositiveIntegerField(blank=False)


class Post(models.Model):
    """ Represents a Post created by a user. """

    author = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts"
    )
    text = models.TextField(blank=False)
    imgUrl = models.URLField(blank=False)
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
    created = models.DateTimeField(auto_now_add=True)

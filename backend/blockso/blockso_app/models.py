from django.db import models

# Create your models here.


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
        to=User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    bio = models.TextField()
    image = models.URLField()


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
        to=User,
        on_delete=models.CASCADE,
        related_name="src"
    )
    dest = models.ForeignKey(
        to=User,
        on_delete=models.CASCADE,
        related_name="dest"
    )

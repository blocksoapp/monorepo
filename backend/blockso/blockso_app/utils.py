"""
Module containing functions commonly used
in the blockso_app application.
"""
# std lib imports

# third party imports

# local imports
from blockso_app.models import Feed, Profile


def get_profiles_to_watch():
    """
    Returns a list of profiles to watch.
    """
    # fetch the union of:
    # - users that have logged in
    logged_in = Profile.objects.all().exclude(user__last_login=None)
    # - users that have have followers
    have_followers = Profile.objects.all().exclude(follow_dest=None)
    # - users that are on a feed that has followers
    on_feed = Profile.objects.filter(
        feeds_following_them__in=Feed.objects.all().exclude(followers=None)
    )
    profiles = logged_in | have_followers | on_feed

    return profiles

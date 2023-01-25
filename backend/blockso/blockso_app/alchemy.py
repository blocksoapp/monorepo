"""
Module that interfaces with the Alchemy API.
"""
# std lib imports

# third party imports
from django.conf import settings
import requests

# our imports
from blockso_app.models import Feed, Profile


url = "https://dashboard.alchemy.com/api/update-webhook-addresses"
api_token = settings.ALCHEMY_NOTIFY_TOKEN
webhook_id = settings.ALCHEMY_WH_ID
session = requests.Session()


def update_notify_webhook():
    """
    Updates the Notify webhook with the current list
    of addresses that should be watched.
    """
    # fetch the union of users that have logged in or
    # have followers or are part of a Feed
    logged_in = Profile.objects.all().exclude(user__last_login=None)
    have_followers = Profile.objects.all().exclude(follow_dest=None)
    on_feed = Profile.objects.filter(
        feeds_following_them__in=Feed.objects.all()
    )
    profiles = logged_in | have_followers | on_feed

    # get addresses
    addresses = list(profiles.values_list("user_id", flat=True))

    # make request
    session.headers.update({"X-Alchemy-Token": api_token})
    resp = session.put(url, json={
        "webhook_id": webhook_id, "addresses": addresses
    })
    resp.raise_for_status()

"""
Module that interfaces with the Alchemy API.
"""
# std lib imports

# third party imports
from django.conf import settings
import requests

# our imports
from blockso_app.models import Feed, Profile
from blockso_app import utils


url = "https://dashboard.alchemy.com/api/update-webhook-addresses"
api_token = settings.ALCHEMY_NOTIFY_TOKEN
webhook_id = settings.ALCHEMY_WH_ID
session = requests.Session()


def update_notify_webhook():
    """
    Updates the Notify webhook with the current list
    of addresses that should be watched.
    """
    profiles = utils.get_profiles_to_watch()

    # get addresses
    addresses = list(profiles.values_list("user_id", flat=True))

    # make request
    session.headers.update({"X-Alchemy-Token": api_token})
    resp = session.put(url, json={
        "webhook_id": webhook_id, "addresses": addresses
    })
    resp.raise_for_status()

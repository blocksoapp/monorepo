"""
Module containing singleton of connection to web3 provider.
"""
# std lib imports

# third party imports
from django.conf import settings
import requests
import web3

# our imports


class Web3Provider():
    """ Singleton for web3 provider. """

    def __new__(cls):
        if not hasattr(cls, 'instance'):
          cls.instance = super(Web3Provider, cls).__new__(cls)

        return cls.instance

    def __init__(self):
        # configure requests session used for the underlying connection
        session = requests.Session()

        # the main entrypoint to the provider
        self.provider = web3.Web3.HTTPProvider(
            settings.ALCHEMY_HTTPS_URL,
            session=session
        )


# instance of web3 to be used throughout codebase
w3 = web3.Web3(Web3Provider().provider)

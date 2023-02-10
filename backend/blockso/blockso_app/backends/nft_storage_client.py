"""
This module is a client implementation for the nft.storage API.
"""
# std lib imports

# third party imports
from django.conf import settings
import requests

# local imports


class NFTStorageClient:

    """ Create a singleton instance of the NFTStorageClient class. """

    def __new__(cls, *args, **kwargs):
        if not hasattr(cls, 'instance'):
            cls.instance = super(NFTStorageClient, cls).__new__(cls)
        return cls.instance

    def __init__(self):
        """ Initialize the NFTStorageClient class. """

        # create a session object for the client
        self.session = requests.Session()
        
        # set the bearer token for the client
        self.session.headers.update({
            "Authorization": f"Bearer {settings.NFT_STORAGE_API_KEY}",
            "Content-Type": "application/json"
        })

        # set the gateway url for the client
        self.gateway_url = "https://{cid}.{suffix}"

    def get_file_url(self, cid):
        """ Get the url for a cid. """

        # return the file uri
        return self.gateway_url.format(
            cid=cid,
            suffix=settings.NFT_STORAGE_GATEWAY_SUFFIX
        )

    def upload(self, file):
        """ Upload a file to the nft.storage API. """

        # make the request
        contents = b"".join(file)
        response = self.session.post(
            url=f"{settings.NFT_STORAGE_API_URL}/upload",
            data=contents
        )

        # raise an exception if the response is not 200
        response.raise_for_status()

        # return the response
        return response

    def get(self, cid):
        """ Get information of a file on the nft.storage API. """

        # make the request
        response = self.session.get(
            url=f"{settings.NFT_STORAGE_API_URL}/{cid}"
        )

        # raise an exception if the response is not 200
        response.raise_for_status()

        # return the response
        return response

    def delete(self, cid):
        """ Delete a file from the nft.storage API. """

        # make the request
        response = self.session.delete(
            url=f"{settings.NFT_STORAGE_API_URL}/{cid}"
        )

        # raise an exception if the response is not 200
        response.raise_for_status()

        # return the response
        return response

    def cat(self, cid):
        """
        Get the contents of a file on the nft.storage API.
        """
        # make the request
        response = self.session.get(
            url=self.get_file_url(cid=cid)
        )

        # raise an exception if the response is not 200
        response.raise_for_status()

        # return the response
        return response.text

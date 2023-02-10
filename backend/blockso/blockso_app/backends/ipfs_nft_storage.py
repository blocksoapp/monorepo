"""
IPFS Django storage backend.
Reference: https://github.com/jeffbr13/django-ipfs-storage
"""
# std lib imports
from urllib.parse import urlparse

# third party imports
from django.conf import settings
from django.core.files.base import File, ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

# local imports
from . import nft_storage_client


@deconstructible
class InterPlanetaryFileSystemStorage(Storage):
    """
    IPFS Django storage backend.

    Only file creation and reading is supported
    due to the nature of the IPFS protocol.
    """

    def __init__(self):
        """
        Use the NFT Storage API to add/pin/remove files.
        """
        self._nft_storage_client = nft_storage_client.NFTStorageClient() 

    def _open(self, name: str, mode='rb') -> File:
        """
        Retrieve the file content identified by multihash.

        :param name: IPFS Content ID multihash.
        :param mode: Ignored. The returned File instance is read-only.
        """
        content = self._nft_storage_client.cat(name)
        return ContentFile(content, name=name)

    def _save(self, name: str, content: File) -> str:
        """
        Add and pin content to IPFS.

        :param name: Ignored. Provided to comply with `Storage` interface.
        :param content: Django File instance to save.
        :return: IPFS Content ID multihash.
        """
        response = self._nft_storage_client.upload(content.__iter__())
        data = response.json()

        return data["value"]["cid"]

    def get_valid_name(self, name):
        """Returns name. Only provided for compatibility with Storage interface."""
        return name

    def get_available_name(self, name, max_length=None):
        """Returns name. Only provided for compatibility with Storage interface."""
        return name

    def size(self, name: str) -> int:
        """Total size, in bytes, of IPFS content with multihash `name`."""
        response = self._nft_storage_client.get(name)
        data = response.json()
        return response.data['value']['size']

    def delete(self, name: str):
        """Unpin IPFS content from the daemon."""
        self._nft_storage_client.delete(name)

    def url(self, name: str):
        """
        Returns an HTTP-accessible Gateway URL by default.

        :param name: IPFS Content ID multihash.
        :return: HTTP URL to access the content via an IPFS HTTP Gateway.
        """
        return self._nft_storage_client.get_file_url(name)

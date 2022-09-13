# std lib imports
from unittest import mock

# third party imports
from rest_framework.test import APITestCase

# our imports


class ProfileTests(APITestCase):
    # test:
    # - updating profile
    # - retrieving profile
    # - following another user 

    def setUp(self):
        """ Runs before each test. """

        super().setUp()
        self.maxDiff = None
        self.test_addr = "0x405fdce8c8a213cdbcb691e9f55031b94e9847ef"

    def test_create_profile(self):
        """
        Assert that a profile is created successfully.
        Assert that the created profile info is returned as JSON.
        """
        # prepare test
        req_data = {
            "image": "https://ipfs.io/ipfs/QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
            "socials": {
                "website": "",
                "telegram": "",
                "discord": "",
                "twitter": "",
                "opensea": "",
                "looksrare": "",
                "snapshot": ""
            },
            "bio": "Hello world, I am a user."
        }
        url = f"/api/{self.test_addr}/profile/"

        # make request
        resp = self.client.post(url, req_data)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        expected = req_data
        expected.update({
            "address": self.test_addr,
            "numFollowers": 0,
            "numFollowing": 0,
            "posts": []
        })
        self.assertDictEqual(resp.data, expected)

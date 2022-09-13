# std lib imports
from unittest import mock

# third party imports
from rest_framework.test import APITestCase

# our imports


class ProfileTests(APITestCase):
    """ Tests profile related behavior. """

    def setUp(self):
        """ Runs before each test. """

        super().setUp()
        self.maxDiff = None
        self.test_addr = "0x405fdce8c8a213cdbcb691e9f55031b94e9847ef"
        self.create_data = {
            "image": "https://ipfs.io/ipfs/QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
            "bio": "Hello world, I am a user.",
            "socials": {
                "website": "https://mysite.com/",
                "telegram": "https://t.me/nullbitx8",
                "discord": "https://discord.gg/nullbitx8",
                "twitter": "https://twitter.com/nullbitx8",
                "opensea": "https://opensea.com/nullbitx8.eth",
                "looksrare": "https://looksrare.org/nullbitx8.eth",
                "snapshot": "https://snapshot.org/nullbitx8.eth"
            }
        }

    def test_create_profile(self):
        """
        Assert that a profile is created successfully.
        Assert that the created profile info is returned as JSON.
        """
        # prepare test
        url = f"/api/{self.test_addr}/profile/"

        # make POST request
        resp = self.client.post(url, self.create_data)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        expected = self.create_data
        expected.update({
            "address": self.test_addr,
            "numFollowers": 0,
            "numFollowing": 0,
            "posts": []
        })
        self.assertDictEqual(resp.data, expected)

    def test_update_profile(self):
        """
        Assert that a profile is updated successfully.
        Assert that the updated profile info is returned as JSON.
        """
        # prepare test
        url = f"/api/{self.test_addr}/profile/"
        self.client.post(url, self.create_data)  # create profile

        # change some profile info
        update_data = self.create_data
        update_data["image"] = "https://ipfs.io/ipfs/nonexistent"
        update_data["bio"] = "short bio"
        update_data["socials"]["website"] = "https://newsite.com"

        # make PUT request
        resp = self.client.put(url, update_data)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        expected = update_data
        expected.update({
            "address": self.test_addr,
            "numFollowers": 0,
            "numFollowing": 0,
            "posts": []
        })
        self.assertDictEqual(resp.data, expected)

    def test_retrieve_profile(self):
        """
        Assert that a profile is retreived successfully.
        """
        # prepare test
        url = f"/api/{self.test_addr}/profile/"
        self.client.post(url, self.create_data)  # create profile

        # make GET request
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        expected = self.create_data
        expected.update({
            "address": self.test_addr,
            "numFollowers": 0,
            "numFollowing": 0,
            "posts": []
        })
        self.assertDictEqual(resp.data, expected)

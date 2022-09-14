# std lib imports
from datetime import datetime
from unittest import mock

# third party imports
from django.contrib.sessions.models import Session
from rest_framework.test import APITestCase
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
import eth_account

# our imports


class BaseTest(APITestCase):
    """ Base class for all tests. """

    @classmethod
    def setUpClass(cls):
        """ Runs once before all tests. """

        super(BaseTest, cls).setUpClass()

        # create a test wallet (signer)
        cls.test_signer = eth_account.Account.create()

    def setUp(self):
        """ Runs before each test. """

        super().setUp()
        self.maxDiff = None  # more verbose test output
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
        self.siwe_message_data = {
            "address": self.test_signer.address,
            "domain": "127.0.0.1",
            "version": "1",
            "chain_id": "1",
            "uri": "http://127.0.0.1/api/auth/login",
            "nonce": "",
            "issued_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }


class AuthTests(BaseTest):
    """
    Tests authentication using ETH wallet.
    Auth is based on https://eips.ethereum.org/EIPS/eip-4361
    and https://github.com/payton/django-siwe-auth/blob/main/siwe_auth/views.py
    """

    def _do_login(self):
        """
        Utility function to get a nonce, sign a message, and do a login.
        """
        # create user
        url = f"/api/{self.test_signer.address}/profile/"
        self.client.post(url, self.create_data)

        # get nonce from backend
        resp = self.client.get("/api/auth/nonce/")
        self.siwe_message_data["nonce"] = resp.data["nonce"]

        # prepare message
        message = SiweMessage(self.siwe_message_data).sign_message()

        # sign message
        signed_msg = self.test_signer.sign_message(
            eth_account.messages.encode_defunct(text=message)
        )

        # make login request
        url = "/api/auth/login/"
        data = {
            "message": message,
            "signature": signed_msg.signature.hex()
        }
        resp = self.client.post(url, data)

        # return response
        return resp

    def test_nonce(self):
        """
        Assert that a nonce is returned to the user.
        """
        # set up test
        url = "/api/auth/nonce/"

        # make request
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        nonce = Nonce.objects.all()[0]
        self.assertEqual(resp.data["nonce"], nonce.value) 

    def test_login(self):
        """
        Assert that a user can create a session by signing a message.
        """
        resp = self._do_login()

        # make assertions
        # assert that the user has a session
        self.assertEqual(resp.status_code, 200)
        session_key = self.client.cookies.get("sessionid").value
        session = Session.objects.get(session_key=session_key)
        session_data = session.get_decoded()
        self.assertEqual(
            session_data["_auth_user_id"],
            self.test_signer.address
        )

    def test_logout(self):
        """
        Assert that a user can terminate their session by logging out.
        """
        # prepare test
        self._do_login()

        # logout
        resp = self.client.post("/api/auth/logout/")

        # make assertions
        # assert that the user no longer has a session
        self.assertEqual(resp.status_code, 200)
        session_key = self.client.cookies.get("sessionid").value
        self.assertEqual(session_key, "")


class ProfileTests(BaseTest):
    """ Tests profile related behavior. """

    def test_create_profile(self):
        """
        Assert that a profile is created successfully.
        Assert that the created profile info is returned as JSON.
        """
        # prepare test
        url = f"/api/{self.test_signer.address}/profile/"

        # make POST request
        resp = self.client.post(url, self.create_data)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        expected = self.create_data
        expected.update({
            "address": self.test_signer.address,
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
        url = f"/api/{self.test_signer.address}/profile/"
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
            "address": self.test_signer.address,
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
        url = f"/api/{self.test_signer.address}/profile/"
        self.client.post(url, self.create_data)  # create profile

        # make GET request
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        expected = self.create_data
        expected.update({
            "address": self.test_signer.address,
            "numFollowers": 0,
            "numFollowing": 0,
            "posts": []
        })
        self.assertDictEqual(resp.data, expected)

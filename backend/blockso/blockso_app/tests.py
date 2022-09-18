# std lib imports
from datetime import datetime
from unittest import mock
import json

# third party imports
from django.contrib.sessions.models import Session
from rest_framework.test import APITestCase
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
import eth_account
import responses

# our imports
from .models import Follow, Post
from . import jobs


class BaseTest(APITestCase):
    """ Base class for all tests. """

    @classmethod
    def setUpClass(cls):
        """ Runs once before all tests. """

        super(BaseTest, cls).setUpClass()
        cls.maxDiff = None  # more verbose test output

        # create a test wallet (signer)
        cls.test_signer = eth_account.Account.create()

        # common data for creating profile
        cls.create_data = {
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

        # common data for authentication
        cls.siwe_message_data = {
            "address": cls.test_signer.address,
            "domain": "127.0.0.1",
            "version": "1",
            "chain_id": "1",
            "uri": "http://127.0.0.1/api/auth/login",
            "nonce": "",
            "issued_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        # sample tx history json
        with open(
            "./blockso_app/covalent-tx-history-sample.json",
            "r"
        ) as fobj:
            cls.tx_history_resp_data = fobj.read() 

    def setUp(self):
        """ Runs before each test. """

        super().setUp()

        # fake requests/responses
        self.mock_responses = responses.RequestsMock()
        self.mock_responses.start()

        # clean up all mock patches
        self.addCleanup(mock.patch.stopall)

    def tearDown(self):
        """ Runs after each test. """

        super().tearDown()

        # clean up fake requests/responses
        self.mock_responses.stop()
        self.mock_responses.reset()

    def _do_login(self):
        """
        Utility function to get a nonce, sign a message, and do a login.
        Returns the response of the login request.
        Note: the authentication backend creates a user if one
        does not already exist for the wallet doing the authentication.
        """
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

    def _create_profile(self):
        """
        Utility function to create a Profile using
        the given test data.
        This function will usually be called after authenticating
        with the _do_login function above.
        """
        # register a response for a covalent API request that
        # is made after creating a profile
        self.mock_responses.add(
            responses.GET,
            jobs.get_tx_history_url(self.test_signer.address),
            body=self.tx_history_resp_data
        )

        # create profile
        url = f"/api/{self.test_signer.address}/profile/"
        resp = self.client.post(url, self.create_data)
        return resp


class AuthTests(BaseTest):
    """
    Tests authentication using ETH wallet.
    Auth is based on https://eips.ethereum.org/EIPS/eip-4361
    and https://github.com/payton/django-siwe-auth/blob/main/siwe_auth/views.py
    """

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
        # do login
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
        self._do_login()

        # make POST request
        resp = self._create_profile()

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
        self._do_login()
        self._create_profile()

        # change some profile info
        update_data = self.create_data
        update_data["image"] = "https://ipfs.io/ipfs/nonexistent"
        update_data["bio"] = "short bio"
        update_data["socials"]["website"] = "https://newsite.com"

        # make PUT request
        url = f"/api/{self.test_signer.address}/profile/"
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
        Assert that a profile is retrieved successfully.
        """
        # prepare test
        self._do_login()
        self._create_profile()

        # make GET request
        url = f"/api/{self.test_signer.address}/profile/"
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

    def test_retrieve_user(self):
        """
        Assert that a user can get their own info once logged in.
        """
        # prepare test
        self._do_login()

        # make request
        resp = self.client.get("/api/user/")

        # make assertions
        # assert that the user receives information about themselves
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            resp.data["address"],
            self.test_signer.address
        )
        self.assertIsNone(resp.data["profile"])

        # create user profile
        self._create_profile()
        resp = self.client.get("/api/user/")
        self.assertEqual(resp.status_code, 200)
        self.assertIsNotNone(resp.data["profile"])

    def test_retrieve_user_unauthed(self):
        """
        Assert that a user cannot get their own info
        if they are not logged in.
        """
        # prepare test
        # make request
        resp = self.client.get("/api/user/")
        
        # assert 403
        self.assertEqual(resp.status_code, 403)


class FollowTests(BaseTest):
    """
    Tests follow related behavior.
    """

    def setUp(self):
        """ Runs before each test. """

        super().setUp()
        self.test_signer_2 = eth_account.Account.create()

        # register response for getting tx history
        self.mock_responses.add(
            responses.GET,
            jobs.get_tx_history_url(self.test_signer_2.address),
            body=self.tx_history_resp_data
        )

    def test_follow(self):
        """
        Assert that a user can follow another.
        """
        # prepare test
        # create user 1 and log them in
        self._do_login()
        self._create_profile()

        # create user 2
        url = f"/api/{self.test_signer_2.address}/profile/"
        self.client.post(url, self.create_data)

        # make request for user 1 to follow user 2
        url = f"/api/{self.test_signer_2.address}/follow/"
        resp = self.client.post(url)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        follow = Follow.objects.get(
            src_id=self.test_signer.address,
            dest_id=self.test_signer_2.address
        )
        self.assertIsNotNone(follow)

    def test_unfollow(self):
        """
        Assert that a user can unfollow another.
        """
        # prepare test
        # create user 1 and log them in
        self._do_login()
        self._create_profile()

        # create user 2
        url = f"/api/{self.test_signer_2.address}/profile/"
        self.client.post(url, self.create_data)

        # make request for user 1 to follow user 2
        url = f"/api/{self.test_signer_2.address}/follow/"
        resp = self.client.post(url)

        # make request for user 1 to UNFOLLOW user 2
        url = f"/api/{self.test_signer_2.address}/follow/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 204)
        with self.assertRaises(Follow.DoesNotExist):
            Follow.objects.get(
                src_id=self.test_signer.address,
                dest_id=self.test_signer_2.address
            )


class TransactionParsingTests(BaseTest):
    """
    Tests behavior related to getting transaction history
    and using it to create Posts.
    """

    def setUp(self):
        """ Runs before each test. """

        super().setUp()

        # register response for getting tx history
        self.mock_responses.add(
            responses.GET,
            jobs.get_tx_history_url(self.test_signer.address),
            body=self.tx_history_resp_data
        )

    def test_process_address_txs(self):
        """
        Assert that an address' tx history is retrieved
        and parsed correctly.
        Assert that the address now has Posts that
        reflect their transaction history.
        """
        # set up test
        # done in setUp and setUpClass

        # call function
        jobs.process_address_txs(self.test_signer.address)

        # make assertions
        # assert that the correct number of Posts has been created
        post_count = Post.objects.all().count()
        expected = json.loads(self.tx_history_resp_data)
        expected = len(expected["data"]["items"])
        self.assertEqual(post_count, expected)


class PostTests(BaseTest):
    """
    Test behavior around posts and feeds.
    """

    def setUp(self):
        """
        Runs before each test.
        """
        super().setUp()

        self.create_post_data = { 
            "text": "My first post!",
            "imgUrl": "https://fakeimage.com/img.png",
            "isShare": False,
            "isQuote": False,
            "refPost": None,
            "refTx": None
        }

    def _create_post(self):
        """
        Utility function to create a post.
        Returns the response of creating a post.
        """
        url = f"/api/posts/{self.test_signer.address}/"
        resp = self.client.post(url, self.create_post_data)
        return resp

    def test_create_post(self):
        """
        Assert that a post is created successfully by a logged in user.
        """
        # set up test
        self._do_login()

        # make request
        resp = self._create_post()

        # make assertions
        self.assertEqual(resp.status_code, 201)

    def test_update_post(self):
        """
        Assert that a post is updated successfully.
        Assert that the updated post is returned in the response.
        """
        # prepare test
        self._do_login()
        resp = self._create_post()
        post_id = resp.data["id"]
        new_text = "My updated post."

        # change some post info
        update_data = self.create_post_data
        update_data["text"] = new_text 

        # make PUT request
        url = f"/api/post/{post_id}/"
        resp = self.client.put(url, update_data)

        # make assertions
        expected = resp.data
        expected["text"] = new_text
        self.assertEqual(resp.status_code, 200)
        self.assertDictEqual(resp.data, expected)

    def test_delete_post(self):
        """
        Assert that a post is deleted successfully.
        """
        # prepare test
        self._do_login()
        resp = self._create_post()
        post_id = resp.data["id"]

        # delete the post
        url = f"/api/post/{post_id}/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(
            Post.objects.filter(author=self.test_signer.address).count(),
            0
        )

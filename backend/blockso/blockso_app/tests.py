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
        cls.test_signer_2 = eth_account.Account.create()

        # common data for creating profile
        cls.create_profile_data = {
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

        # common data for creating posts
        cls.create_post_data = { 
            "text": "My first post!",
            "imgUrl": "https://fakeimage.com/img.png",
            "isShare": False,
            "isQuote": False,
            "refPost": None,
            "refTx": None
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

    def _get_siwe_message_data(self, signer):
        """ Returns common data used for siwe (sign in with ethereum). """

        return {
            "address": signer.address,
            "domain": "127.0.0.1",
            "version": "1",
            "chain_id": "1",
            "uri": "http://127.0.0.1/api/auth/login",
            "nonce": "",
            "issued_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    def _do_login(self, signer):
        """
        Utility function to get a nonce, sign a message, and do a login.
        Returns the response of the login request.
        Note: the authentication backend creates a user if one
        does not already exist for the wallet doing the authentication.
        """
        # get nonce from backend
        resp = self.client.get("/api/auth/nonce/")
        nonce = resp.data["nonce"]

        # prepare message
        message_data = self._get_siwe_message_data(signer)
        message_data["nonce"] = nonce
        message = SiweMessage(message_data).sign_message()

        # sign message
        signed_msg = signer.sign_message(
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

    def _do_logout(self):
        """
        Utility function to log out a user.
        Returns the response of the logout request.
        """
        url = "/api/auth/logout/"
        return self.client.post(url)

    def _create_profile(self, signer):
        """
        Utility function to create a Profile using
        the given test data.
        This function will usually be called after authenticating
        with the _do_login function above.
        """
        # create profile
        url = f"/api/{signer.address}/profile/"
        resp = self.client.post(url, self.create_profile_data)
        return resp

    def _create_post(self, signer):
        """
        Utility function to create a post.
        Returns the response of creating a post.
        """
        url = f"/api/posts/{signer.address}/"
        resp = self.client.post(url, self.create_post_data)
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
        resp = self._do_login(self.test_signer)

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
        self._do_login(self.test_signer)

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
        self._do_login(self.test_signer)

        # make POST request
        resp = self._create_profile(self.test_signer)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        expected = self.create_profile_data
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
        self._do_login(self.test_signer)
        self._create_profile(self.test_signer)

        # change some profile info
        update_data = self.create_profile_data
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

    # TODO remove or update this patch when a job queue is added
    @mock.patch("blockso_app.jobs.process_address_txs", lambda x: None)
    def test_retrieve_profile(self):
        """
        Assert that a profile is retrieved successfully.
        """
        # prepare test
        self._do_login(self.test_signer)
        self._create_profile(self.test_signer)

        # make GET request
        url = f"/api/{self.test_signer.address}/profile/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        expected = self.create_profile_data
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
        self._do_login(self.test_signer)

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
        self._create_profile(self.test_signer)
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

    def test_follow(self):
        """
        Assert that a user can follow another.
        """
        # prepare test
        # create user 1 and log them in
        self._do_login(self.test_signer)
        self._create_profile(self.test_signer)
        self._do_logout()

        # create user 2
        self._do_login(self.test_signer_2)
        self._create_profile(self.test_signer_2)
        self._do_logout()

        # make request for user 1 to follow user 2
        self._do_login(self.test_signer)
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
        self._do_login(self.test_signer)
        self._create_profile(self.test_signer)

        # create user 2
        url = f"/api/{self.test_signer_2.address}/profile/"
        self.client.post(url, self.create_profile_data)

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
    Test behavior around posts.
    """

    def test_create_post(self):
        """
        Assert that a post is created successfully by a logged in user.
        """
        # set up test
        self._do_login(self.test_signer)

        # make request
        resp = self._create_post(self.test_signer)

        # make assertions
        self.assertEqual(resp.status_code, 201)

    def test_get_post(self):
        """
        Assert that a post is retrieved successfully by any user.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post(self.test_signer)
        post_id = resp.data["id"]

        # make request
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)

    def test_update_post(self):
        """
        Assert that a post is updated successfully.
        Assert that the updated post is returned in the response.
        """
        # prepare test
        self._do_login(self.test_signer)
        resp = self._create_post(self.test_signer)
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
        self._do_login(self.test_signer)
        resp = self._create_post(self.test_signer)
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


class FeedTests(BaseTest):
    """
    Test behavior around feeds.
    """

    def test_get_feed(self):
        """
        Assert that a logged in user can get a feed of posts.
        """
        # set up test
        self._do_login(self.test_signer)

        # make request to get a feed
        url = "/api/feed/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, [])

    def test_get_feed_does_not_follow_others(self):
        """
        Assert that if a user is not following anyone,
        only their own posts will show up in their feed.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post(self.test_signer)
        expected_posts = [resp.data]

        # make request to get a feed
        url = "/api/feed/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, expected_posts)

    def test_get_feed_follows_others(self):
        """
        Assert that if a user is following others,
        both their posts and those they follow will show up in their feed.
        """
        # set up test
        # login user 2, create a post
        expected = []
        self._do_login(self.test_signer_2)
        resp = self._create_post(self.test_signer_2)
        expected = expected + [resp.data]

        # logout user 2
        self._do_logout()

        # login user 1, create a post, and follow user 2
        self._do_login(self.test_signer)
        resp = self._create_post(self.test_signer)
        expected = [resp.data] + expected
        url = f"/api/{self.test_signer_2.address}/follow/"
        self.client.post(url)

        # get feed of user 1
        url = "/api/feed/"
        resp = self.client.get(url)

        # assert user 1 feed has the posts of user 1 and user 2
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
        self.assertDictEqual(resp.data[0], expected[0])
        self.assertDictEqual(resp.data[1], expected[1])

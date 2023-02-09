# std lib imports
from datetime import datetime, timedelta, timezone
from unittest import mock
import json
import pytz

# third party imports
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from rest_framework.test import APITestCase
from siwe_auth.models import Nonce
from siwe.siwe import SiweMessage
from web3.datastructures import AttributeDict
import eth_account
import fakeredis
import responses
import rq

# our imports
from .jobs import alchemy_jobs, covalent_jobs
from .models import Feed, Follow, Post, Profile, Transaction, \
                    ERC20Transfer, ERC721Transfer, Notification, \
                    MentionedInCommentEvent, MentionedInPostEvent
from .samples import alchemy_notify_samples
from .views import get_expected_alchemy_sig
from .web3_client import w3
from . import alchemy, redis_client


UserModel = get_user_model()


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

        # sample tx history json for erc20 transactions
        next_update = datetime.now(timezone.utc) + timedelta(minutes=5)
        next_update = next_update.isoformat().replace("+00:00", "000Z")
        cls.covalent_next_update = next_update
        with open(
            "./blockso_app/samples/covalent-tx-history-sample.json",
            "r",
            encoding="utf-8"
        ) as fobj:
            content = fobj.read() 
            # replace all occurrences of the address in the tx history sample
            # with the address of our test signer
            content = content.replace(
                "0xa79e63e78eec28741e711f89a672a4c40876ebf3",
                cls.test_signer.address.lower()
            )

            # replace the next_update_at field with a time 5 min in the future
            content = content.replace(
                "REPLACEME_NEXT_UPDATE_AT",
                cls.covalent_next_update
            )
            cls.erc20_tx_resp_data = content

        # sample tx history json for erc721 transactions
        with open(
            "./blockso_app/samples/covalent-tx-history-erc721.json",
            "r",
            encoding="utf-8"
        ) as fobj:
            content = fobj.read() 
            # replace all occurrences of the address in the tx sample
            # with the address of our test signer
            content = content.replace(
                "0xc9eb983357b88921a89844d7047589a37b563108",
                cls.test_signer.address.lower()
            )

            # replace the next_update_at field with a time 5 min in the future
            content = content.replace(
                "REPLACEME_NEXT_UPDATE_AT",
                cls.covalent_next_update
            )
            cls.erc721_tx_resp_data = content

    def setUp(self):
        """ Runs before each test. """

        super().setUp()

        # mock redis backend for use in tests 
        self.redis_backend = fakeredis.FakeRedis()
        redis_patcher = mock.patch(
            "redis.from_url",
            return_value=self.redis_backend
        )
        redis_patcher.start()

        # create redis queue and scheduled jobs registry for use in tests
        self.redis_queue = rq.Queue(
            connection=self.redis_backend,
            is_async=False
        )
        self.scheduled_job_registry = rq.registry.ScheduledJobRegistry(
            queue=self.redis_queue
        )

        # fake requests/responses
        self.mock_responses = responses.RequestsMock()
        self.mock_responses.start()

        # clean up all mock patches in the end
        self.addCleanup(mock.patch.stopall)

        # common data for updating profile
        self.update_profile_data = {
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
        self.create_post_data = { 
            "text": "",
            "tagged_users": [],
            "imgUrl": "",
            "isShare": False,
            "isQuote": False,
            "refPost": None,
            "refTx": None
        }

    def tearDown(self):
        """ Runs after each test. """

        super().tearDown()

        # clean up fake redis backend
        self.redis_backend.flushall()

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
            "issued_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
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

    def _create_users(self, amount):
        """
        Utility function to create amount number of users.
        Returns a list of signers that contain the wallets
        of all the created users.
        """
        signers = []
        for i in range(amount):
            signer = eth_account.Account.create()
            self._do_login(signer)  # a user is created when signer logs in
            signers.append(signer)

        return signers

    def _update_profile(self, signer):
        """
        Utility function to create a Profile using
        the given test data.
        This function will usually be called after authenticating
        with the _do_login function above.
        """
        # update profile
        url = f"/api/{signer.address}/profile/"
        resp = self.client.put(url, self.update_profile_data)
        return resp

    def _create_post(self, tagged_users=[]):
        """
        Utility function to create a post.
        Returns the response of creating a post.
        """
        # prepare request
        url = f"/api/post/"
        data = self.create_post_data
        data["text"] = "My first post!"
        data["imgUrl"] = "https://fakeimage.com/img.png"
        data["tagged_users"] = tagged_users

        # send request
        resp = self.client.post(url, data)

        return resp

    def _repost(self, post_id):
        """
        Utility function to repost a post.
        Returns the response of creating the repost.
        """
        # prepare request
        url = f"/api/post/"
        data = self.create_post_data
        data["isShare"] = True
        data["refPost"] = post_id

        # send request
        resp = self.client.post(url, data)

        return resp

    def _create_comment(self, post_id, text, tagged_users=[]):
        """
        Utility function to create a comment on a post.
        Returns the response of creating a comment.
        """
        url = f"/api/posts/{post_id}/comments/"
        data = {"text": text, "tagged_users": tagged_users}
        resp = self.client.post(url, data)
        return resp

    def _follow_user(self, address):
        """
        Utility function to follow the user with the given address.
        Returns the response of following the user.
        """
        url = f"/api/{address}/follow/"
        resp = self.client.post(url)
        return resp

    def _create_feed(self, name="", description="", editable=False):
        """
        Utility function to create a Feed.
        Returns the response of creating the feed.
        """
        url = "/api/feeds/"
        data = {
            "name": name,
            "description": description,
            "followingEditableByPublic": editable
        }
        resp = self.client.post(url, data)

        return resp

    def _create_feed_image(self, feed_id):
        """
        Utility function to create a Feed.
        Returns the response of creating the feed.
        """
        url = f"/api/feeds/{feed_id}/image/"
        fake_img = SimpleUploadedFile("test.jpg", b"", content_type="image/jpeg")
        data = encode_multipart(data={"image": fake_img}, boundary=BOUNDARY)
        resp = self.client.put(
            url,
            data,
            content_type=MULTIPART_CONTENT
        )

        return resp

    def _follow_feed(self, feed_id):
        """
        Utility function to follow the given feed.
        Returns the response of following the user.
        """
        url = f"/api/feeds/{feed_id}/follow/"
        resp = self.client.post(url)

        return resp

    def _add_feed_following(self, feed_id, address):
        """
        Utility function to follow the given address by the given feed.
        Returns the response of following the user by the feed.
        """
        url = f"/api/feeds/{feed_id}/following/{address}/"
        resp = self.client.post(url)

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

    def test_logout_unauthed(self):
        """
        Assert that a user can call logout even if they are not authenticated.
        """
        # prepare test
        # logout
        resp = self.client.post("/api/auth/logout/")

        # make assertions
        # assert that the user no longer has a session
        self.assertEqual(resp.status_code, 200)

    def test_auth_get_session(self):
        """
        Assert that an authenticated user gets
        their authenticated ethereum address and chain id
        when they make a GET to /auth/session/.
        """
        # do login
        self._do_login(self.test_signer)

        # make request to session endpoint
        url = f"/api/auth/session/"
        resp = self.client.get(url)

        # assert correct data
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["address"], self.test_signer.address)
        self.assertEqual(resp.data["chainId"], 1)

    def test_auth_get_session_unauthenticated(self):
        """
        Assert that an un-authenticated user gets
        a 403 when they GET /auth/session/.
        """
        # make request to session endpoint without logging in
        url = f"/api/auth/session/"
        resp = self.client.get(url)

        # assert correct data
        self.assertEqual(resp.status_code, 403)


class ProfileTests(BaseTest):
    """ Tests profile related behavior. """

    def test_create_profile(self):
        """
        Assert that a profile is created when a user signs in for the first time.
        Assert that the created profile info is returned as JSON.
        """
        # prepare test and create profile
        self._do_login(self.test_signer)
        
        # make assertions
        url = f"/api/{self.test_signer.address}/profile/"
        resp = self.client.get(url)
        self.assertEqual(resp.data["address"], self.test_signer.address)
        self.assertEqual(resp.data["image"], "")
        self.assertEqual(resp.data["bio"], "")
        self.assertIsNotNone(resp.data["lastLogin"])

    def test_update_profile(self):
        """
        Assert that a profile is updated successfully.
        Assert that the updated profile info is returned as JSON.
        """
        # prepare test
        self._do_login(self.test_signer)

        # change some profile info
        update_data = self.update_profile_data
        update_data["image"] = "https://ipfs.io/ipfs/nonexistent"
        update_data["bio"] = "short bio"
        update_data["socials"]["website"] = "https://newsite.com"

        # make PUT request
        url = f"/api/{self.test_signer.address}/profile/"
        resp = self.client.put(url, update_data)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        profile = Profile.objects.get(user_id=self.test_signer.address)
        expected = update_data
        expected.update({
            "address": self.test_signer.address,
            "numFollowers": 0,
            "numFollowing": 0,
            "followedByMe": False,
            "lastLogin": profile.user.last_login
        })
        self.assertDictEqual(resp.data, expected)

    def test_retrieve_profile(self):
        """
        Assert that a profile is retrieved successfully.
        """
        # prepare test
        self._do_login(self.test_signer)
        self._update_profile(self.test_signer)

        # make GET request
        url = f"/api/{self.test_signer.address}/profile/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        profile = Profile.objects.get(user_id=self.test_signer.address)
        expected = self.update_profile_data
        expected.update({
            "address": self.test_signer.address,
            "numFollowers": 0,
            "numFollowing": 0,
            "followedByMe": False,
            "lastLogin": profile.user.last_login 
        })
        self.assertEqual(resp.data, expected)

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
        self.assertIsNotNone(resp.data["profile"])
        self.assertIsNotNone(resp.data["profile"]["lastLogin"])

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

    def test_get_suggested_users(self):
        """
        Assert that users starting with the given
        query are returned successfully.
        """
        # prepare test
        self._do_login(self.test_signer)
        self._do_logout()
        self._do_login(self.test_signer_2)

        # make request
        # query using 0x + the first 3 characters of the address
        query = self.test_signer.address[:5]
        resp = self.client.get(f"/api/users/?q={query}")
        
        # assert 200
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["address"],
            self.test_signer.address
        )

    def test_get_suggested_users_pagination(self):
        """
        Assert that suggested users are paginated.
        """
        # prepare test
        self._do_login(self.test_signer)
        self._do_logout()
        self._do_login(self.test_signer_2)

        # make request
        # query using an empty string to get all users
        query = ""
        resp = self.client.get(f"/api/users/?q={query}")
        
        # assert results are paginated
        self.assertIn("results", resp.data)
        self.assertIn("next", resp.data)


class FollowTests(BaseTest):
    """
    Tests follow related behavior.
    """

    def setUp(self):
        """ Runs before each test. """

        super().setUp()

        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

    def test_follow(self):
        """
        Assert that a user can follow another.
        """
        # prepare test
        # create user 1
        self._do_login(self.test_signer)
        self._do_logout()

        # create user 2
        self._do_login(self.test_signer_2)
        self._do_logout()

        # make request for user 1 to follow user 2
        self._do_login(self.test_signer)
        url = f"/api/{self.test_signer_2.address}/follow/"
        resp = self.client.post(url)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        follow = Follow.objects.get(
            src_id=Profile.objects.get(user_id=self.test_signer.address),
            dest_id=Profile.objects.get(user_id=self.test_signer_2.address)
        )
        self.assertIsNotNone(follow)

    def test_unfollow(self):
        """
        Assert that a user can unfollow another.
        """
        # prepare test
        # create user 1 and log them in
        self._do_login(self.test_signer)

        # create user 2
        url = f"/api/{self.test_signer_2.address}/profile/"
        self.client.post(url, self.update_profile_data)

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
                src=Profile.objects.get(user_id=self.test_signer.address),
                dest=Profile.objects.get(user_id=self.test_signer_2.address)
            )

    def test_get_followers_following(self):
        """
        Assert that a user can see who follows a user.
        Assert that a user can see who a user follows.
        """
        # prepare test
        # create users 1 and 2
        # and make user 2 follow user 1
        self._do_login(self.test_signer)
        self._do_logout()
        self._do_login(self.test_signer_2)
        self._follow_user(self.test_signer.address)

        # make request to get followers of user 1
        url = f"/api/{self.test_signer.address}/followers/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(
            resp.data["results"][0]["address"],
            self.test_signer_2.address
        )
        self.assertIsNone(resp.data["next"])

        # make request to get following of user 2
        url = f"/api/{self.test_signer_2.address}/following/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(
            resp.data["results"][0]["address"],
            self.test_signer.address
        )
        self.assertIsNone(resp.data["next"])

    def test_get_followers_ordering(self):
        """
        Assert that the followers of a user are
        ordered based on when they were followed,
        from most recent to least recent.
        """
        # prepare test
        # create 5 users and make them follow user 1
        signers = self._create_users(5)
        for i in range(1, len(signers)):
            self._do_login(signers[i])
            self._follow_user(signers[0].address)

        # get the followers of user 1
        url = f"/api/{signers[0].address}/followers/"
        resp = self.client.get(url)

        # assert that the followers are ordered by most recent
        followers = resp.data["results"]
        for i in range(len(followers)):
            self.assertEqual(
                followers[i]["address"],
                signers[4-i].address
            )

    def test_get_following_ordering(self):
        """
        Assert that the following of a user
        are ordered based on when they were followed
        by the user, from most recent to least recent.
        """
        # prepare test
        # create 5 users and make user 1 follow them all
        signers = self._create_users(5)
        self._do_login(signers[0])
        for i in range(1, len(signers)):
            self._follow_user(signers[i].address)

        # get the following of user 1
        url = f"/api/{signers[0].address}/following/"
        resp = self.client.get(url)

        # assert that the following are ordered by most recent
        following = resp.data["results"]
        for i in range(len(following)):
            self.assertEqual(
                following[i]["address"],
                signers[4-i].address
            )

    def test_follow_update_alchemy_wh(self):
        """
        Assert that a request is made to update the addresses
        in Alchemy Notify when a user is followed.
        """
        # create 5 users and log them in
        expected = []
        signers = self._create_users(5)
        for i in range(len(signers)):
            self._do_login(signers[i])
            expected.append(signers[i].address)
        
        # set up a mock response that asserts that the request
        # to alchemy was made with the expected parameters
        self.mock_responses.replace(
            responses.PUT,
            alchemy.url,
            match=[
                responses.matchers.header_matcher(
                    {"X-Alchemy-Token": settings.ALCHEMY_NOTIFY_TOKEN}
                ),
                responses.matchers.json_params_matcher(
                    {
                        "webhook_id": settings.ALCHEMY_WH_ID,
                        "addresses": expected
                    }
                )
            ]
        )

        # make user 1 follow user 2
        self._do_login(signers[0])
        self._follow_user(signers[1].address)


class CovalentTransactionParsingTests(BaseTest):
    """
    Tests behavior related to getting transaction history
    from Covalent and using it to create Posts.
    """

    def _mock_tx_history_response(self, address, json_response):
        """
        Mocks a response for user tx history.
        """
        self.mock_responses.add(
            responses.GET,
            covalent_jobs.get_tx_history_url(address, 0),
            body=json_response
        )

    def test_process_address_txs(self):
        """
        Assert that an address' tx history is retrieved
        and parsed correctly.
        Assert that the address now has Transactions that
        reflect their transaction history.
        """
        # set up test
        self._mock_tx_history_response(
            self.test_signer.address,
            self.erc20_tx_resp_data
        )

        # call function
        covalent_jobs.process_address_txs(self.test_signer.address)

        # make assertions
        # assert that the correct number of Transactions has been created
        tx_count = Transaction.objects.all().count()
        self.assertEqual(tx_count, 6)

    def test_process_erc20_transfers(self):
        """
        Assert that an address' tx history is retrieved
        and parsed correctly.
        Assert that the address now has ERC20Transfers that
        reflect their transaction history.
        """
        # set up test
        self._mock_tx_history_response(self.test_signer.address, self.erc20_tx_resp_data)

        # call function
        covalent_jobs.process_address_txs(self.test_signer.address)

        # make assertions
        # assert that the correct number of ERC20Transfers has been created
        transfer_count = ERC20Transfer.objects.all().count()
        self.assertEqual(transfer_count, 4)

    def test_process_erc721_transfers(self):
        """
        Assert that a user's history with erc721 txs
        is parsed and stored correctly.
        """
        # set up test
        self._mock_tx_history_response(
            self.test_signer.address,
            self.erc721_tx_resp_data
        )

        # call function
        covalent_jobs.process_address_txs(self.test_signer.address)

        # make assertions
        # assert that the correct number of Transactions has been created
        tx_count = Transaction.objects.all().count()
        self.assertEqual(tx_count, 1)

        # assert that the correct number of Posts has been created
        # there should be as many Posts as Transactions/Transfers where
        # the post author is the from address
        self.assertEqual(Post.objects.all().count(), 1)

        # assert that the correct number of ERC721Transfers has been created
        erc721_transfer_count = ERC721Transfer.objects.all().count()
        self.assertEqual(erc721_transfer_count, 1)

    def test_posts_originate_from_address(self):
        """
        Assert that posts are only created for
        transactions or transfers that originate
        from the given address.
        This is meant to reduce spam and provide more
        quality posts.
        """
        # set up test
        self._mock_tx_history_response(self.test_signer.address, self.erc20_tx_resp_data)

        # call function
        covalent_jobs.process_address_txs(self.test_signer.address)

        # make assertions
        # assert that the correct number of Posts has been created
        post_count = Post.objects.all().count()
        self.assertEqual(post_count, 6)

    def test_process_address_tx_no_limit(self):
        """
        Assert that the entire tx history of a user is paginated
        through when the 'limit' argument is None and covalent
        says there are more pages with results.
        """
        # set up test
        # mock first covalent response to indicate there are more results
        has_more_results = self.erc20_tx_resp_data.replace(
            '"has_more": false',
            '"has_more": true'
        )
        self.mock_responses.add(
            responses.GET,
            covalent_jobs.get_tx_history_url(self.test_signer.address, 0),
            body=has_more_results
        )

        # mock second covalent response to indicate there are no more results
        # note that the url being mocked has page number 1 which means
        # we are expecting the code to paginate through the results
        no_more_results = self.erc721_tx_resp_data
        self.mock_responses.add(
            responses.GET,
            covalent_jobs.get_tx_history_url(self.test_signer.address, 1),
            body=no_more_results
        )

        # run the job
        covalent_jobs.process_address_txs(self.test_signer.address, limit=None)

        # assert that all of the users' tx history was parsed
        self.assertEqual(ERC721Transfer.objects.all().count(), 1)
        self.assertEqual(ERC20Transfer.objects.all().count(), 4)


class AlchemyNotifyTxParsingTests(BaseTest):
    """
    Tests behavior related to getting transaction history
    from Alchemy Notify and using it to create Posts.
    """

    def setUp(self):
        """ Runs before each test. """

        super().setUp()

        # mock get_block return data -- only mocking values we need
        mock_block_data = AttributeDict({
            'timestamp': 1673395967
        })
        self.web3_get_block_patcher = mock.patch(
            "web3.eth.Eth.get_block",
            return_value=mock_block_data
        )
        self.web3_get_block_patcher.start()

        # mock get_transaction return data -- only mocking values we need
        mock_tx_data = AttributeDict({
            'from': '0xA1E4380A3B1f749673E270229993eE55F35663b4',
            'to': '0x5DF9B87991262F6BA471F09758CDE1c0FC1De734',
            'value': 31337,
        })
        self.web3_get_transaction_by_block_patcher = mock.patch(
            "web3.eth.Eth.get_transaction_by_block",
            return_value=mock_tx_data
        )
        self.web3_get_transaction_by_block_patcher.start()
        self.web3_get_transaction_patcher = mock.patch(
            "web3.eth.Eth.get_transaction",
            return_value=mock_tx_data
        )
        self.web3_get_transaction_patcher.start()

        # mock contract call function
        self.web3_call_patcher = mock.patch(
            "web3.contract.ContractFunction.call",
            return_value="Fake Val"
        )
        self.web3_call_patcher.start()

    def tearDown(self):
        """ Runs after each test. """

        super().tearDown()

        # clean up web3 patcher
        self.web3_get_block_patcher.stop()
        self.web3_get_transaction_patcher.stop()
        self.web3_get_transaction_by_block_patcher.stop()
        self.web3_call_patcher.stop()

    @mock.patch("web3.eth.Eth.get_transaction")
    def test_process_external_eth_transfer(self, mock_get_tx):
        """
        Assert that an external eth transfer
        from or to an address is handled correctly.
        Assert that a Transaction is created.
        Assert that a Post is created for the
        sender and recipient.
        """
        # set up test
        eth_transfer = alchemy_notify_samples.eth_transfer
        activity = eth_transfer["event"]["activity"][0]
        mock_get_tx.return_value = AttributeDict({
            "from": activity["fromAddress"],
            "to": activity["toAddress"],
            'value': 31337
        })

        # call function
        alchemy_jobs.process_webhook_data(eth_transfer)

        # make assertions
        # assert that a Transaction was created
        tx = Transaction.objects.get(tx_hash=activity["hash"])

        # assert that a Post was created for both the from and to addresses
        from_address = w3.toChecksumAddress(activity["fromAddress"])
        from_post = Post.objects.get(author__user_id=from_address)
        self.assertEqual(from_post.refTx, tx)

        to_address = w3.toChecksumAddress(activity["toAddress"])
        to_post = Post.objects.get(author__user_id=to_address)
        self.assertEqual(to_post.refTx, tx)

    @mock.patch("web3.eth.Eth.get_transaction")
    def test_process_multiple_external_eth_transfer(self, mock_get_tx):
        """
        Assert that multiple external eth transfers
        are handled correctly.
        Assert that a Transaction is created.
        Assert that a Post is created for the
        sender and recipient.
        """
        # set up test
        eth_transfers = alchemy_notify_samples.multiple_eth_transfers
        side_effects = []
        for item in eth_transfers["event"]["activity"]:
            side_effects.append(
                AttributeDict({
                    "from": item["fromAddress"],
                    "to": item["toAddress"],
                    'value': 31337
                })
            )
        mock_get_tx.side_effect = side_effects

        # call function
        alchemy_jobs.process_webhook_data(eth_transfers)

        # make assertions
        for item in eth_transfers["event"]["activity"]:
            # assert that a Transaction was created
            tx = Transaction.objects.get(tx_hash=item["hash"])

            # assert that a Post was created for both the from and to addresses
            from_address = w3.toChecksumAddress(item["fromAddress"])
            self.assertEqual(1,
                Post.objects.filter(
                    author__user_id=from_address, refTx=tx
                ).count()
            )

            to_address = w3.toChecksumAddress(item["toAddress"])
            self.assertEqual(1,
                Post.objects.filter(
                    author__user_id=to_address, refTx=tx
                ).count()
            )

    def test_process_erc20_transfer(self):
        """
        Assert that an erc20 transfer is parsed correctly.
        Assert that a Transaction is created for the tx that
        the erc20 transfer relates to.
        Assert that the from and to addresses now have Posts that
        reflect their transaction history.
        """
        # set up test
        erc20_transfer = alchemy_notify_samples.erc20_transfer

        # call function
        alchemy_jobs.process_webhook_data(erc20_transfer)

        # make assertions
        # assert that a Transaction was created
        activity = erc20_transfer["event"]["activity"][0]
        tx = Transaction.objects.get(tx_hash=activity["hash"])

        # assert that an ERC20Transfer was created
        transfer = ERC20Transfer.objects.get(tx=tx)
        self.assertEqual(
            transfer.from_address,
            w3.toChecksumAddress(activity["fromAddress"])
        )
        self.assertEqual(
            transfer.to_address,
            w3.toChecksumAddress(activity["toAddress"])
        )
        self.assertEqual(
            transfer.contract_address,
            w3.toChecksumAddress(activity["rawContract"]["address"])
        )
        self.assertEqual(
            transfer.amount,
            str(w3.toInt(hexstr=activity["log"]["data"]))
        )

        # assert that a Post was created for both the from and to addresses
        from_address = w3.toChecksumAddress(activity["fromAddress"])
        from_post = Post.objects.get(author__user_id=from_address)
        self.assertEqual(from_post.refTx, tx)

        to_address = w3.toChecksumAddress(activity["toAddress"])
        to_post = Post.objects.get(author__user_id=to_address)
        self.assertEqual(to_post.refTx, tx)

    def test_process_erc721_transfer(self):
        """
        Assert that an erc721 transfer is parsed correctly.
        Assert that a Transaction is created for the tx that
        the erc721 transfer relates to.
        Assert that the from and to addresses now have Posts that
        reflect their transaction history.
        """
        # set up test
        erc721_transfer = alchemy_notify_samples.erc721_transfer

        # call function
        alchemy_jobs.process_webhook_data(erc721_transfer)

        # make assertions
        # assert that a Transaction was created
        activity = erc721_transfer["event"]["activity"][0]
        tx = Transaction.objects.get(tx_hash=activity["hash"])

        # assert that an ERC721Transfer was created
        transfer = ERC721Transfer.objects.get(tx=tx)
        self.assertEqual(
            transfer.from_address,
            w3.toChecksumAddress(activity["fromAddress"])
        )
        self.assertEqual(
            transfer.to_address,
            w3.toChecksumAddress(activity["toAddress"])
        )
        self.assertEqual(
            transfer.contract_address,
            w3.toChecksumAddress(activity["rawContract"]["address"])
        )
        self.assertEqual(
            transfer.token_id,
            str(w3.toInt(hexstr=activity["erc721TokenId"]))
        )

        # assert that a Post was not created for the from address since
        # the from is the zero address
        from_address = w3.toChecksumAddress(activity["fromAddress"])
        from_post = Post.objects.filter(author__user_id=from_address)
        self.assertEqual(from_post.exists(), False)

        # assert that a Post was created for the to address
        to_address = w3.toChecksumAddress(activity["toAddress"])
        to_post = Post.objects.get(author__user_id=to_address)
        self.assertEqual(to_post.refTx, tx)

    def test_reorged_transaction(self):
        """
        Assert that a reorged transaction is 
        removed from the database, along with
        any related Posts.
        """
        # set up test
        erc721_transfer = alchemy_notify_samples.erc721_transfer
        activity = erc721_transfer["event"]["activity"][0]

        # process a webhook request where removed = False
        # therefore it should create objects in the database
        alchemy_jobs.process_webhook_data(erc721_transfer)

        # assert that a Transaction, ERC721Transfer, and Post were created
        tx = Transaction.objects.get(tx_hash=activity["hash"])
        self.assertTrue(ERC721Transfer.objects.filter(tx=tx).exists())
        self.assertTrue(
            Post.objects.filter(
                author__user_id=w3.toChecksumAddress(activity["toAddress"])
            ).exists()
        )

        # process a follow up webhook request where removed = True 
        # therefore it should remove all objects related to the
        # transaction that was reorged
        reorged_transfer = alchemy_notify_samples.reorged_erc721_transfer
        alchemy_jobs.process_webhook_data(reorged_transfer)

        # assert that the Transaction, ERC721Transfer, and Post were deleted
        self.assertFalse(
            Transaction.objects.filter(tx_hash=activity["hash"]).exists()
        )
        self.assertFalse(ERC721Transfer.objects.filter(tx=tx).exists())
        self.assertFalse(
            Post.objects.filter(
                author__user_id=w3.toChecksumAddress(activity["toAddress"])
            ).exists()
        )


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
        resp = self._create_post()

        # make assertions
        self.assertEqual(resp.status_code, 201)

    def test_get_post(self):
        """
        Assert that a post is retrieved successfully by any user.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)

    def test_get_posts(self):
        """
        Assert that a list of a user's posts are
        retrieved successfully by any user.
        Assert that the posts are paginated by 20.
        Assert that the posts are sorted in chronological
        order from most recent to least recent.
        """
        # set up test
        self._do_login(self.test_signer)

        # create 25 posts
        user = UserModel.objects.get(pk=self.test_signer.address)
        created_time = datetime.now(tz=pytz.UTC)
        for i in range(25):
            created_time = created_time + timedelta(hours=1)
            Post.objects.create(
                author=user.profile,
                created=created_time,
                isQuote=False,
                isShare=False
            )

        # make request
        url = f"/api/{self.test_signer.address}/posts/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        results = resp.data["results"]
        self.assertEqual(len(results), 20)  # 20 results

        # assert chronological ordering
        for i in range(1, len(results)):
            prev = i - 1
            self.assertGreaterEqual(
                datetime.fromisoformat(results[prev]["created"][:-1]),
                datetime.fromisoformat(results[i]["created"][:-1])
            )

        # assert job to fetch tx history was added to the high queue
        queue = redis_client.RedisConnection().get_high_queue()
        jobs = queue.get_job_ids()
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0], self.test_signer.address)

    def test_get_posts_queue_job(self):
        """
        Assert that a job is queued to fetch
        the tx history of the user when
        fetching their posts.
        """
        # set up test
        self._do_login(self.test_signer)

        # make request
        url = f"/api/{self.test_signer.address}/posts/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)

        # assert job to fetch tx history was added to the high queue
        queue = redis_client.RedisConnection().get_high_queue()
        jobs = queue.get_job_ids()
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0], self.test_signer.address)

    def test_update_post(self):
        """
        Assert that a post is updated successfully.
        Assert that the updated post is returned in the response.
        """
        # prepare test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        new_text = "My updated post."

        # change some post info
        update_data = self.create_post_data
        update_data["text"] = new_text 
        update_data["tagged_users"] = [self.test_signer.address]

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
        resp = self._create_post()
        post_id = resp.data["id"]

        # delete the post
        url = f"/api/post/{post_id}/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(
            Post.objects.filter(
                author=Profile.objects.get(user_id=self.test_signer.address)
            ).count(),
            0
        )

    def test_get_post_ref_tx(self):
        """
        Assert that a post with a refTx will return
        the details of the transaction in the serialized
        post data response. 
        """
        # set up test
        self._do_login(self.test_signer)
        # create posts using the test covalent tx history API 
        self.mock_responses.add(
            responses.GET,
            covalent_jobs.get_tx_history_url(self.test_signer.address, 0),
            body=self.erc20_tx_resp_data
        )
        covalent_jobs.process_address_txs(self.test_signer.address)

        # assert that post 1 has a general reference transaction
        url = "/api/post/1/"
        resp = self.client.get(url)
        self.assertEqual(
            resp.data["refTx"]["tx_hash"],
            "0x3a6db035bb71e695628860d6f488b9f8deaa72ce506eace855"\
            "2a7c515346e323"
        )

        # assert that post 5 has a reference transaction
        # that includes erc20 transfers
        # refTx tied to them
        url = "/api/post/5/"
        resp = self.client.get(url)
        self.assertEqual(
            resp.data["refTx"]["tx_hash"],
            "0x9fd2eb7db94cf71ddc665b48dad42e1d00d90ace525fd6a047"\
            "9f958cce8a729f"
        )
        self.assertEqual(
            resp.data["refTx"]["erc20_transfers"][0]["contract_address"],
            w3.toChecksumAddress(
                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
            )
        )

    def test_get_num_comments(self):
        """
        Assert that a post includes the
        number of comments on it.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._create_comment(post_id, text="hello")
        self._create_comment(post_id, text="world")

        # get the post details
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.data["numComments"], 2)

    def test_get_post_pfp(self):
        """
        Assert that a post includes the
        pfp of the author of the post.
        """
        # set up test
        self._do_login(self.test_signer)
        self._update_profile(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(
            resp.data["author"]["image"],
            self.update_profile_data["image"]
        )

    def test_tag_users_in_post(self):
        """
        Assert that a user can tag other users in a post.
        """
        # set up test
        self._do_login(self.test_signer)
        self._do_login(self.test_signer_2)

        # make request
        tagged = [self.test_signer.address]
        resp = self._create_post(
            tagged_users=tagged
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(
            MentionedInPostEvent.objects.filter(
                notification__user__user_id=self.test_signer.address
            ).count(),
            1
        )

    def test_tag_everyone_in_post(self):
        """
        Assert that a user can tag everyone in a post.
        """
        # set up test
        # create 5 users
        signers = self._create_users(5)
        addresses = [signer.address for signer in signers]

        # make request
        self._do_login(signers[0])
        tagged = ["everyone", addresses[1]]
        resp = self._create_post(
            tagged_users=tagged
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)

        # assert that all users received notifications
        notifs = Notification.objects.filter(user__user_id__in=addresses[1:])
        self.assertEqual(notifs.count(), 4)
        self.assertEqual(
            MentionedInPostEvent.objects.filter(
                notification__in=notifs
            ).count(),
            4
        )

        # assert that the post author did not receive a notification
        self.assertEqual(
            Notification.objects.filter(user__user_id=addresses[0]).count(),
            0
        )
        self.assertEqual(
            MentionedInPostEvent.objects.filter(
                notification__user__user_id=addresses[0]
            ).count(),
            0
        )

    def test_like_unlike_post(self):
        """
        Assert that a user can like/unlike another user's post.
        """
        # set up test
        # user 1 creates post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request by user 2 to like user 1 post
        url = f"/api/post/{post_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)

        # assert post was liked successfully
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["liker"]["address"], 
            self.test_signer_2.address
        )

        # make request by user 2 to unlike user 1 post
        resp = self.client.delete(url)

        # assert post was unliked successfully
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 0)
        self.assertEqual(resp.data["results"], [])

    def test_like_post_twice(self):
        """
        Assert that a user cannot like a post twice.
        """
        # set up test
        # user 1 creates post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request by user 2 to like user 1's post twice
        url = f"/api/post/{post_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)
        resp = self.client.post(url)

        # assert second like was unsuccessful
        self.assertEqual(resp.status_code, 400)

        # assert that total likes is 1
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["liker"]["address"], 
            self.test_signer_2.address
        )

    def test_get_post_num_likes(self):
        """
        Assert that the number of likes a post has is returned
        as part of the serialized Post data.
        """
        # set up test
        # user 1 creates post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 likes user 1's post
        url = f"/api/post/{post_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)

        # make request to get the post
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)
        
        # make assertions
        self.assertEqual(resp.data["numLikes"], 1)

    def test_get_post_liked_by_me(self):
        """
        Assert that likedByMe is True if the user liked the given post.
        Assert that likedByMe is False otherwise.
        """
        # set up test
        # user 1 creates post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 likes user 1's post
        url = f"/api/post/{post_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)

        # make request to get the post
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)
        
        # make assertions
        self.assertEqual(resp.data["likedByMe"], True)

    def test_repost(self):
        """
        Assert that a user can repost another user's post.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost as user 2
        self._do_login(self.test_signer_2)
        resp = self._repost(post_id)

        # assert that user 2 now has a post that references user 1's post
        self.assertEqual(resp.status_code, 201)
        new_post_id = resp.data["id"]
        url = f"/api/post/{new_post_id}/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["refPost"]["id"], post_id)
        self.assertEqual(
            resp.data["refPost"]["author"]["address"],
            self.test_signer.address
        )
        self.assertTrue(resp.data["isShare"])
        self.assertFalse(resp.data["isQuote"])
        self.assertIsNone(resp.data["refTx"])
        self.assertEqual(resp.data["text"], "")
        self.assertEqual(resp.data["imgUrl"], "")

    def test_resposted_by_me_and_num_reposts(self):
        """
        Assert that 'respostedByMe' is True if the user
        reposted the post in question.
        Assert that 'numReposts' is correct.
        """
        # prepare test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost as user 2
        self._do_login(self.test_signer_2)
        self._repost(post_id)

        # make request to get original post as user 2
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)
        
        # assert that repostedByMe is True
        self.assertTrue(resp.data["repostedByMe"])
        # assert that numReposts is equal to 1
        self.assertEqual(resp.data["numReposts"], 1)

        # get feed of user 2
        self._do_login(self.test_signer_2)
        url = f"/api/feed/"
        resp = self.client.get(url)

        # assert that repostedByMe is True
        self.assertEqual(resp.data["results"][0]["refPost"]["repostedByMe"], True)
        # assert that numReposts is equal to 1
        self.assertEqual(resp.data["results"][0]["refPost"]["numReposts"], 1)

    def test_get_reposted_by_me_unauthed(self):
        """
        Assert that 'respostedByMe' is False if the
        current user is not authenticated.
        """
        # prepare test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request to get original post as unauthed user
        self._do_logout()
        url = f"/api/post/{post_id}/"
        resp = self.client.get(url)
        
        # assert that repostedByMe is False
        self.assertFalse(resp.data["repostedByMe"])

    def test_cannot_repost_own_post(self):
        """
        Assert that a user cannot repost their own post.
        """
        # prepare test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # try to repost it as user 1
        resp = self._repost(post_id)

        # assert 400 BAD REQUEST
        self.assertEqual(resp.status_code, 400)

    def test_cannot_repost_item_twice(self):
        """
        Assert that a user cannot repost an item twice.
        """
        # prepare test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost it as user 2
        self._do_login(self.test_signer_2)
        self._repost(post_id)

        # try to repost it again and
        # assert 400 BAD REQUEST
        resp = self._repost(post_id)
        self.assertEqual(resp.status_code, 400)

    def test_cannot_repost_a_repost(self):
        """
        Assert that a user cannot repost a repost.
        """
        # prepare test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost it as user 2
        self._do_login(self.test_signer_2)
        resp = self._repost(post_id)
        repost_id = resp.data["id"]

        # repost the repost as user 1
        self._do_login(self.test_signer)
        resp = self._repost(repost_id)

        # assert 400 BAD REQUEST
        self.assertEqual(resp.status_code, 400)

    def test_delete_repost(self):
        """
        Assert that a user can delete their repost.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost as user 2
        self._do_login(self.test_signer_2)
        resp = self._repost(post_id)
        repost_id = resp.data["id"]

        # make request to delete repost of original post_id
        url = f"/api/post/{post_id}/repost/"
        resp = self.client.delete(url)

        # assert deletion was successful
        self.assertEqual(resp.status_code, 204)
        url = f"/api/post/{repost_id}/" 
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)


class CommentsTests(BaseTest):
    """
    Test behavior around comments.
    """

    def test_create_comment(self):
        """
        Assert that a comment is created successfully by a logged in user.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request
        text = "I <3 your post!"
        resp = self._create_comment(post_id, text=text)

        # make assertions
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["id"], 1)
        self.assertEqual(resp.data["post"], 1)
        self.assertEqual(resp.data["text"], text)
        self.assertEqual(
            resp.data["author"]["address"],
            self.test_signer.address
        )

    def test_create_comment_empty(self):
        """
        Assert that creating an empty comment
        returns a 400 BAD REQUEST.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request
        resp = self._create_comment(post_id, text="")

        # make assertions
        self.assertEqual(resp.status_code, 400)

    def test_tag_users_in_comment(self):
        """
        Assert that a user can tag other users in a comment.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request
        text = f"I <3 @{self.test_signer.address}'s post!"
        tagged = [self.test_signer.address]
        resp = self._create_comment(
            post_id,
            text=text,
            tagged_users=tagged
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["text"], text)
        self.assertEqual(
            MentionedInCommentEvent.objects.filter(
                notification__user__user_id=self.test_signer.address
            ).count(),
            1
        )

    def test_tag_everyone_in_comment(self):
        """
        Assert that a user can tag everyone in a comment.
        """
        # set up test
        # create 5 users and a post
        signers = self._create_users(5)
        addresses = [signer.address for signer in signers]
        self._do_login(signers[0])
        resp = self._create_post()
        post_id = resp.data["id"]

        # make request to mention everyone in a comment
        tagged = ["everyone", addresses[1]]
        resp = self._create_comment(
            post_id,
            "hello frens",
            tagged_users=tagged
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)

        # assert that all users received notifications
        notifs = Notification.objects.filter(user__user_id__in=addresses[1:])
        self.assertEqual(notifs.count(), 4)
        self.assertEqual(
            MentionedInCommentEvent.objects.filter(
                notification__in=notifs
            ).count(),
            4
        )

        # assert that the post author did not receive a notification
        self.assertEqual(
            MentionedInCommentEvent.objects.filter(
                notification__user__user_id=addresses[0]
            ).count(),
            0
        )

    def test_list_comments(self):
        """
        Assert that a user can view comments on a post.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._create_comment(post_id, text="hello")

        # make request
        url = f"/api/posts/{post_id}/comments/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["results"]), 1)

    def test_list_comments_ordering(self):
        """
        Assert that comments are ordered from newest to oldest.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._create_comment(post_id, text="goodbye")
        self._create_comment(post_id, text="hello")

        # make request
        url = f"/api/posts/{post_id}/comments/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        results = resp.data["results"]
        self.assertEqual(results[0]["text"], "hello")
        self.assertEqual(results[1]["text"], "goodbye")

    def test_list_comments_pagination(self):
        """
        Assert that comments are paginated by 5.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # create 7 comments
        for i in range(7):
            self._create_comment(post_id, text=f"comment {i+1}")

        # make request
        url = f"/api/posts/{post_id}/comments/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["results"]), 5)

        # make request for second page
        resp = self.client.get(resp.data["next"])

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["results"]), 2)

    def test_list_comments_pfp(self):
        """
        Assert that a comment includes the pfp of its author
        as part of its deserialized data.
        """
        # set up test
        self._do_login(self.test_signer)
        self._update_profile(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._create_comment(post_id, text="hello")

        # make request
        url = f"/api/posts/{post_id}/comments/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(
            resp.data["results"][0]["author"]["image"],
            self.update_profile_data["image"]
        )

    def test_like_unlike_comment(self):
        """
        Assert that a user can like/unlike another user's comment.
        """
        # set up test
        # user 1 creates post and comment
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        resp = self._create_comment(post_id, "hello")
        comment_id = resp.data["id"]

        # make request by user 2 to like user 1's comment
        url = f"/api/posts/{post_id}/comments/{comment_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)

        # assert comment was liked successfully
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["liker"]["address"], 
            self.test_signer_2.address
        )

        # make request by user 2 to unlike user 1 comment
        resp = self.client.delete(url)

        # assert comment was unliked successfully
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 0)
        self.assertEqual(resp.data["results"], [])

    def test_like_comment_twice(self):
        """
        Assert that a user cannot like a comment twice.
        """
        # set up test
        # user 1 creates post and comment
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        resp = self._create_comment(post_id, "hello")
        comment_id = resp.data["id"]

        # make request by user 2 to like user 1's comment twice
        url = f"/api/posts/{post_id}/comments/{comment_id}/likes/"
        self._do_login(self.test_signer_2)
        resp = self.client.post(url)
        resp = self.client.post(url)

        # assert second like was unsuccessful
        self.assertEqual(resp.status_code, 400)

        # assert that total likes is 1
        resp = self.client.get(url)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["liker"]["address"], 
            self.test_signer_2.address
        )

    def test_get_comment_num_likes(self):
        """
        Assert that the number of likes a comment has is returned
        as part of the serialized Comment data.
        """
        # set up test
        # user 1 creates post and comment
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        resp = self._create_comment(post_id, "hello")
        comment_id = resp.data["id"]

        # user 2 likes user 1's comment
        url = f"/api/posts/{post_id}/comments/{comment_id}/likes/"
        self._do_login(self.test_signer_2)
        self.client.post(url)

        # make request to get the comment
        url = f"/api/posts/{post_id}/comments/{comment_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.data["numLikes"], 1)

    def test_get_comment_liked_by_me(self):
        """
        Assert that likedByMe is True if the user liked the given comment.
        Assert that likedByMe is False otherwise.
        """
        # set up test
        # user 1 creates post and comment
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        resp = self._create_comment(post_id, "hello")
        comment_id = resp.data["id"]

        # user 2 likes user 1's comment
        url = f"/api/posts/{post_id}/comments/{comment_id}/likes/"
        self._do_login(self.test_signer_2)
        resp = self.client.post(url)

        # make request to get the comment
        url = f"/api/posts/{post_id}/comments/{comment_id}/"
        resp = self.client.get(url)
        
        # make assertions
        self.assertEqual(resp.data["likedByMe"], True)


class FeedTests(BaseTest):
    """
    Test behavior around Feeds.
    """

    def test_get_feed(self):
        """
        Assert that any user can get a specific feed.
        """
        # set up test
        # create a post by user1 and user2
        self._do_login(self.test_signer)
        self._create_post()
        self._do_login(self.test_signer_2)
        self._create_post()
        # create a Feed and add users 1 and 2 it
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])
        feed.following.set(Profile.objects.all())

        # make a request as an unauthenticated user to
        # get the posts of the created Feed
        self._do_logout()
        url = f"/api/feeds/{feed.id}/items/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)
        self.assertEqual(
            resp.data["results"][0]["author"]["address"],
            self.test_signer_2.address
        )
        self.assertEqual(
            resp.data["results"][1]["author"]["address"],
            self.test_signer.address
        )

    def test_list_feeds(self):
        """
        Assert that any user can list all Feeds.
        """
        # set up test
        # create two feeds
        self._do_login(self.test_signer)
        self._create_feed()
        self._create_feed()

        # make request to list feeds
        url = "/api/feeds/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_list_feeds_followed_by_me(self):
        """
        Assert that an authenticated user can list feeds they follow.
        """
        # set up test
        # create two feeds as user 1
        # they are automatically followed by the creator
        self._do_login(self.test_signer)
        self._create_feed()
        self._create_feed()

        # create a third feed by user 2
        self._do_login(self.test_signer_2)
        self._create_feed()

        # make request as user 1
        self._do_login(self.test_signer)
        url = "/api/feeds/followed-by-me/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

        # assert feeds are returned in descending chronological order
        self.assertEqual(resp.data["results"][0]["id"], 2)
        self.assertEqual(resp.data["results"][1]["id"], 1)

    def test_create_feed(self):
        """
        Assert that an authenticated user can create a Feed.
        Assert that the feed is automatically followed by the creator.
        """
        # set up test
        # login user
        self._do_login(self.test_signer)

        # make request to create feed
        resp = self._create_feed(
            name="My Feed",
            description="An example of a feed!",
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["name"], "My Feed")
        self.assertEqual(
            resp.data["owner"]["address"],
            self.test_signer.address
        )
        self.assertEqual(resp.data["description"], "An example of a feed!")
        self.assertEqual(resp.data["numFollowers"], 1)

    def test_create_feed_unauthed(self):
        """
        Assert that an un-authenticated user cannot create a Feed.
        """
        # do not login
        # make request to create feed
        resp = self._create_feed()
        
        # make assertions
        self.assertEqual(resp.status_code, 403)

    def test_delete_feed(self):
        """
        Assert that the owner of a Feed can delete it.
        """
        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to delete it
        url = f"/api/feeds/{feed.id}/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 204)

    def test_delete_feed_not_owner(self):
        """
        Assert that a user cannot delete a Feed they do not own.
        """
        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to delete it from another user
        self._do_login(self.test_signer_2)
        url = f"/api/feeds/{feed.id}/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 403)

    def test_update_feed(self):
        """
        Assert that the owner of a Feed can update its details.
        """
        # create a feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to update its details
        url = f"/api/feeds/{feed.id}/"
        data = {
            "name": "New Name",
            "description": "New Description",
            "image": "https://example.com/"
        }
        self.client.put(url, data)

        # assert that feed has updated data
        resp = self.client.get(url)
        self.assertEqual(resp.data["id"], feed.id)
        self.assertEqual(resp.data["name"], "New Name")
        self.assertEqual(resp.data["description"], "New Description")

    def test_update_feed_not_owner(self):
        """
        Assert that a random user cannot update the details of a Feed.
        """
        # create a feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to update its details as another user
        self._do_login(self.test_signer_2)
        url = f"/api/feeds/{feed.id}/"
        data = {"name":"", "description":"", "image":""}
        resp = self.client.put(url, data)

        # make assertions
        self.assertEqual(resp.status_code, 403)

    def test_retrieve_feed(self):
        """
        Assert that retrieving a feed returns the correct data,
        including number of followers, number of following, and
        whether it is followed by the requesting user.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data["id"]

        # make feed follow a profile
        self._add_feed_following(feed_id, self.test_signer_2.address) 

        # make request to retrieve feed by the creator
        url = f"/api/feeds/{feed_id}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["numFollowing"], 1)
        # feed is automatically followed by its creator
        self.assertEqual(resp.data["numFollowers"], 1)
        self.assertEqual(resp.data["followedByMe"], True)

        # make request to retrieve feed by non-follower
        self._do_login(self.test_signer_2)
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.data["followedByMe"], False)

    def test_add_remove_feed_following(self):
        """
        Assert that a Feed owner can make the Feed follow a profile.
        Assert that a Feed owner can make the Feed unfollow a profile.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to add user 2 to the feed's following
        url = f"/api/feeds/{feed.id}/following/{self.test_signer_2.address}/"
        resp = self.client.post(url)

        # assert that the feed is now following the profile
        self.assertTrue(
            feed.following.filter(user_id=self.test_signer_2.address).exists()
        )

        # make request to remove user 2 from the feed's following
        resp = self.client.delete(url)

        # assert that the feed is no longer following the profile
        self.assertFalse(
            feed.following.filter(user_id=self.test_signer_2.address).exists()
        )

    def test_add_remove_feed_following_not_owner(self):
        """
        Assert that non-owners of Feeds cannot make the
        Feed follow/unfollow a profile.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request as a random user to add user 3 to the feed's following
        self._do_login(self.test_signer_2)
        user_3 = eth_account.Account.create()
        url = f"/api/feeds/{feed.id}/following/{user_3.address}/"
        resp = self.client.post(url)

        # assert that the request failed and the feed is not following user3
        self.assertEqual(resp.status_code, 403)
        self.assertFalse(
            feed.following.filter(user_id=user_3.address).exists()
        )

        # sign in as the feed owner and add user3 to the feed's following
        self._do_login(self.test_signer)
        self.client.post(url)

        # sign in as non-owner and remove user3 from the feed's following
        self._do_login(self.test_signer_2)
        resp = self.client.delete(url)

        # assert that the request failed and the feed is still following user3
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(
            feed.following.filter(user_id=user_3.address).exists()
        )

    def test_add_remove_feed_following_open_feed(self):
        """
        Assert that any authed user can make the Feed follow a profile,
        if the feed is open to editing by the public.
        Assert that any authed user can make the Feed unfollow a profile,
        if the feed is open to editing by the public.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed(editable=True)
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request as a random user to add user 3 to the feed's following
        self._do_login(self.test_signer_2)
        user_3 = eth_account.Account.create()
        url = f"/api/feeds/{feed.id}/following/{user_3.address}/"
        resp = self.client.post(url)

        # assert that the feed is now following the profile
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(
            feed.following.filter(user_id=user_3.address).exists()
        )

        # make request to remove user 3 from the feed's following
        resp = self.client.delete(url)

        # assert that the feed is no longer following the profile
        self.assertFalse(
            feed.following.filter(user_id=user_3.address).exists()
        )

    def test_add_remove_feed_invalid_address(self):
        """
        Assert that adding an invalid address to a
        feed's following returns a 400 BAD REQUEST.
        """
        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed(editable=True)
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request
        resp = self._add_feed_following(feed.id, "invalid-address")

        # make assertions
        self.assertEqual(resp.status_code, 400)

    def test_list_feed_following(self):
        """
        Assert that a user can list the profiles that a feed is following.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create feed and make it follow user 2
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])
        self._add_feed_following(feed.id, self.test_signer_2.address)

        # make a request to list the profiles the feed is following
        url = f"/api/feeds/{feed.id}/following/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["address"],
            self.test_signer_2.address
        )

    def test_list_feed_followers(self):
        """
        Assert that a user can list the profiles that follow a feed.
        """
        # create feed, it is followed automatically by the creator
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make a request to list the profiles that follow the feed
        url = f"/api/feeds/{feed.id}/followers/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(
            resp.data["results"][0]["address"],
            self.test_signer.address
        )

    def test_list_feeds_owned_or_editable(self):
        """
        Assert that an authenticated user can list feeds they own,
        or that are editable by public.
        """
        # set up test
        # create two feeds as user 2
        # one of them is editably by public
        self._do_login(self.test_signer_2)
        self._create_feed(editable=True)
        self._create_feed(editable=False)

        # create a feed owned by user 1
        self._do_login(self.test_signer)
        self._create_feed()

        # make request as user 1 to list feeds that are owned or editable
        url = f"/api/feeds/owned-or-editable/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.data["count"], 2)
        self.assertEqual(
            resp.data["results"][0]["owner"]["address"],
            self.test_signer.address
        )
        self.assertEqual(
            resp.data["results"][0]["followingEditableByPublic"],
            False
        )
        self.assertEqual(
            resp.data["results"][1]["owner"]["address"],
            self.test_signer_2.address
        )
        self.assertEqual(
            resp.data["results"][1]["followingEditableByPublic"],
            True
        )

    def test_follow_unfollow_feed(self):
        """
        Assert that any user can follow a Feed.
        Assert that any user can unfollow a Feed.
        """
        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make request to follow it as another user
        self._do_login(self.test_signer_2)
        url = f"/api/feeds/{feed.id}/follow/"
        resp = self.client.post(url)

        # assert that the user is now following the feed 
        self.assertTrue(
            feed.followers.filter(user_id=self.test_signer_2.address).exists()
        )

        # make request to unfollow the feed
        resp = self.client.delete(url)

        # assert that the user is no longer following the feed 
        self.assertFalse(
            feed.followers.filter(user_id=self.test_signer_2.address).exists()
        )

    def test_list_feed_items(self):
        """
        Assert that any user can list a Feed's items.
        """
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create 2 users and make them create 1 post each
        self._do_login(self.test_signer)
        self._create_post()
        self._do_login(self.test_signer_2)
        self._create_post()

        # create a feed and make it follow users 1 and 2
        resp = self._create_feed()
        feed_id = resp.data["id"]
        self._add_feed_following(feed_id, self.test_signer.address)
        self._add_feed_following(feed_id, self.test_signer_2.address)

        # make a request as an anonymous user to list the items of the feed
        url = f"/api/feeds/{feed_id}/items/"
        self._do_logout()
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_list_feeds_ordered_by_desc_chronological_order(self):
        """
        Assert that listing feeds is ordered by descending chronological order.
        """
        # create 2 feeds
        self._do_login(self.test_signer)
        resp = self._create_feed(name="First Feed")
        first_id = resp.data["id"]
        resp = self._create_feed(name="Second Feed")
        second_id = resp.data["id"]

        # make request to list feeds
        url = f"/api/feeds/"
        resp = self.client.get(url)

        # assert that the ordering is correct
        self.assertEqual(resp.data["results"][0]["name"], "Second Feed")
        self.assertEqual(resp.data["results"][1]["name"], "First Feed")

    def test_feed_following_includes_user(self):
        """
        Assert that a 200 is returned if the feed follows the given user.
        Assert that a 404 if returned if the feed does not follow the user.
        """
        # setup
        # mock out the request to alchemy
        self.mock_responses.add(responses.PUT, alchemy.url)

        # create a feed and add a user to the profiles it follows
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data["id"]
        self._add_feed_following(feed_id, self.test_signer_2.address)

        # make request
        url = f"/api/feeds/{feed_id}/following/{self.test_signer_2.address}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)

        # remove the user from the feed's following
        self.client.delete(url)

        # make request
        url = f"/api/feeds/{feed_id}/following/{self.test_signer_2.address}/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 404)

    def test_update_feed_image(self):
        """
        Assert that the owner of a feed can update its image.
        """
        # set up test
        self.mock_responses.add(
            responses.POST,
            f"{settings.NFT_STORAGE_API_URL}/upload",
            body=json.dumps({"value": {"cid": "fakecid"}})
        )

        # create feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data['id']

        # make request to upload image
        url = f"/api/feeds/{feed_id}/image/"
        fake_img = SimpleUploadedFile("test.jpg", b"", content_type="image/jpeg")
        data = encode_multipart(data={"image": fake_img}, boundary=BOUNDARY)
        resp = self.client.put(
            url,
            data,
            content_type=MULTIPART_CONTENT
        )

        # make assertions
        self.assertEqual(resp.status_code, 201)
        self.assertIn("fakecid", resp.data["image"]) 

    def test_update_feed_image_not_owned(self):
        """
        Assert that a user cannot delete another user's feed image.
        """
        # create feed as user 1
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data["id"]

        # make request to update feed image as user 2
        self._do_login(self.test_signer_2)
        resp = self._create_feed_image(feed_id)

        # make assertions
        self.assertEqual(resp.status_code, 403)
        
    def test_delete_feed_image(self):
        """
        Assert that deleting a feed owner can delete its image.
        """
        # set up test
        self.mock_responses.add(
            responses.POST,
            f"{settings.NFT_STORAGE_API_URL}/upload",
            body=json.dumps({"value": {"cid": "fakecid"}})
        )
        self.mock_responses.add(
            responses.DELETE,
            f"{settings.NFT_STORAGE_API_URL}/fakecid",
        )

        # create feed and image
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data["id"]
        self._create_feed_image(feed_id)

        # make request to delete feed image
        url = f"/api/feeds/{feed_id}/image/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 204)
        url = f"/api/feeds/{feed_id}/"
        resp = self.client.get(url)
        self.assertEqual(resp.data["image"], None)

    def test_delete_feed_image_not_owned(self):
        """
        Assert that deleting a feed owner can delete its image.
        """
        # create feed as user 1
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed_id = resp.data["id"]

        # delete feed image as user 2
        self._do_login(self.test_signer_2)
        url = f"/api/feeds/{feed_id}/image/"
        resp = self.client.delete(url)

        # make assertions
        self.assertEqual(resp.status_code, 403)


class MyFeedTests(BaseTest):
    """
    Test behavior around a user's feed.
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
        self.assertEqual(resp.data["count"], 0)

    def test_get_feed_does_not_follow_others(self):
        """
        Assert that if a user is not following anyone,
        only their own posts will show up in their feed.
        """
        # set up test
        self._do_login(self.test_signer)
        resp = self._create_post()
        expected_posts = [resp.data]

        # make request to get a feed
        url = "/api/feed/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["results"], expected_posts)

    def test_get_feed_follows_others(self):
        """
        Assert that if a user is following others,
        both their posts and those they follow will show up in their feed.
        """
        # set up test
        self.mock_responses.add(responses.PUT, alchemy.url)

        # login user 2, create a post
        self._do_login(self.test_signer_2)
        resp = self._create_post()

        # logout user 2
        self._do_logout()

        # login user 1, create a post, and follow user 2
        self._do_login(self.test_signer)
        resp = self._create_post()
        url = f"/api/{self.test_signer_2.address}/follow/"
        self.client.post(url)

        # get feed of user 1
        url = "/api/feed/"
        resp = self.client.get(url)

        # assert user 1 feed has the posts of user 1 and user 2
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)
        self.assertEqual(
            resp.data["results"][0]["author"]["address"],
            self.test_signer.address
        )
        self.assertEqual(
            resp.data["results"][1]["author"]["address"],
            self.test_signer_2.address
        )


class ExploreTests(BaseTest):
    """
    Test behavior around explore page.
    """

    def test_explore_feed(self):
        """
        Assert that the explore endpoint returns a featured feed.
        """
        # set up test
        # create a feed
        self._do_login(self.test_signer)
        resp = self._create_feed()
        feed = Feed.objects.get(pk=resp.data["id"])

        # make a request to the explore endpoint
        self._do_logout()
        url = "/api/explore/"
        resp = self.client.get(url)

        # assert that the created feed is in the featured feeds
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["feeds"][0]["name"], feed.name)
        self.assertEqual(resp.data["feeds"][0]["image"], None)

    def test_explore_profiles_by_follower_count(self):
        """
        Assert that the top 8 profiles by follower count are returned.
        """
        # set up test
        self.mock_responses.add(responses.PUT, alchemy.url)
        signers = self._create_users(10)

        # make each user follow the remaining users
        # so user 1 follows users 2-10
        # user 2 follows users 3-10, etc
        for i in range(10):
            self._do_login(signers[i])
            for j in range(i+1, 10):
                url = f"/api/{signers[j].address}/follow/"
                self.client.post(url)

        # make request to fetch explore page profiles
        self._do_logout()
        url = "/api/explore/"
        resp = self.client.get(url)

        # make assertions
        # assert that the top 8 profiles are returned
        self.assertEqual(len(resp.data["profiles"]), 8)

        # assert that the explore profiles are sorted
        # in order from most followers to least
        # user 10 should have the most followers
        # user 3 should have the least followers
        for i in range(8):
            self.assertEqual(
                resp.data["profiles"][i]["address"],
                signers[9-i].address
            )

    def test_explore_feeds_by_follower_count(self):
        """
        Assert that the 4 most followed feeds are returned.
        """
        # create 4 feeds
        self._do_login(self.test_signer)
        feeds = []
        for i in range(4):
            resp = self._create_feed(name=i)
            feeds.append(resp.data["id"])

        # create 4 users and follow the feeds in decreasing amounts
        # feeds[0] gets the most follows, feeds[3] gets the least
        signers = self._create_users(4)
        for i in range(4):
            self._do_login(signers[i])
            for j in range(0, 4-i):
                self._follow_feed(feeds[j])

        # make request to explore endpoint
        self._do_logout()
        url = "/api/explore/"
        resp = self.client.get(url)

        # assert that the feeds are sorted
        # from most followers to least followers
        for i in range(4):
            self.assertEqual(resp.data["feeds"][i]["name"], str(i))


class NotificationTests(BaseTest):
    """
    Test behavior around notifications.
    """

    def test_get_notifs(self):
        """
        Assert that a logged in user can get a list of notifications.
        """
        # set up test
        # user 1 logs in
        self._do_login(self.test_signer)

        # make request for notifications
        url = "/api/notifications/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["results"], [])

    def test_get_notifs_unauthed(self):
        """
        Assert that a logged out user cannot get a list of notifications.
        """
        # set up test

        # make request for notifications
        url = "/api/notifications/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 403)

    def test_comment_on_post_notifs(self):
        """
        Assert that a user gets a notification when
        another user comments on their post.
        """
        # set up test
        # user 1 creates a post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._do_logout()

        # user 2 comments on user 1's post
        self._do_login(self.test_signer_2)
        self._create_comment(post_id, text="hello")
        self._do_logout()

        # make request to get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)

        # make assertions
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        notification = resp.data["results"][0]
        self.assertEqual(notification["viewed"], False)
        event = notification["events"]["commentOnPostEvent"]
        self.assertEqual(event["post"], post_id)
        self.assertEqual(
            event["commentor"]["address"],
            self.test_signer_2.address
        )

    def test_mentioned_in_post_notif(self):
        """
        Assert that a user gets a notification when
        another user mentions them in a post.
        """
        # set up test
        # create users 1 and 2
        self._do_login(self.test_signer)
        self._do_login(self.test_signer_2)
        # user 2 tags user 1 in a post
        tagged = [self.test_signer.address]
        resp = self._create_post(
            tagged_users=tagged
        )
        post_id = resp.data["id"]

        # make request to get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)

        # assert that user 1 has a notification for post mention
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        notification = resp.data["results"][0]
        self.assertEqual(notification["viewed"], False)
        event = notification["events"]["mentionedInPostEvent"]
        self.assertEqual(event["post"], post_id)
        self.assertEqual(
            event["mentionedBy"]["address"],
            self.test_signer_2.address
        )

    def test_mentioned_in_comment_notif(self):
        """
        Assert that a user gets a notification when
        another user mentions them in a comment.
        """
        # set up test
        # create users 1 and 2
        self._do_login(self.test_signer)
        self._do_login(self.test_signer_2)
        # user 1 creates a post and a comment
        # where they mention user 2
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        self._create_comment(
            post_id,
            text="hello user 2",
            tagged_users=[self.test_signer_2.address]
        )
        self._do_logout()

        # make request to get user 2's notifications
        self._do_login(self.test_signer_2)
        url = "/api/notifications/"
        resp = self.client.get(url)

        # assert that user 2 has a notification for the comment mention
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        notification = resp.data["results"][0]
        self.assertEqual(notification["viewed"], False)
        event = notification["events"]["mentionedInCommentEvent"]
        self.assertEqual(event["post"], post_id)
        self.assertEqual(
            event["mentionedBy"]["address"],
            self.test_signer.address
        )

    def test_follow_notif(self):
        """
        Assert that a user gets a notification when
        another user follows them.
        """
        # set up test
        self.mock_responses.add(responses.PUT, alchemy.url)
        # create users 1 and 2
        self._do_login(self.test_signer)
        self._do_login(self.test_signer_2)
        # user 2 follows user 1
        self._follow_user(self.test_signer.address)

        # make request to get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)

        # assert that user 1 has a notification for the follow
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        notification = resp.data["results"][0]
        self.assertEqual(notification["viewed"], False)
        event = notification["events"]["followedEvent"]
        self.assertEqual(
            event["followedBy"]["address"],
            self.test_signer_2.address
        )

    def test_mark_notifs_as_viewed(self):
        """
        Assert that a user can mark notification as viewed.
        """
        # set up test
        # user 1 creates a post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 comments on user 1's post twice
        self._do_login(self.test_signer_2)
        self._create_comment(post_id, text="hello")
        self._create_comment(post_id, text="friend")
        self._do_logout()

        # get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)
        notif_ids = [notif['id'] for notif in resp.data["results"]]

        # make request to mark notifications as viewed
        url = "/api/notifications/"
        data = {"notifications": notif_ids}
        resp = self.client.put(url, data)

        # assert that notifications are now viewed
        self.assertEqual(resp.status_code, 200)
        for notif in resp.data:
            self.assertTrue(notif["viewed"])

    def test_mark_notifs_as_viewed_unauthed(self):
        """
        Assert that an unauthenticated user
        cannot mark notifications as viewed.
        """
        # set up test
        # user 1 creates a post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 comments on user 1's post
        self._do_login(self.test_signer_2)
        self._create_comment(post_id, text="hello")

        # get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)
        notif_ids = [notif['id'] for notif in resp.data["results"]]

        # make unauthenticated request to mark notifs as viewed
        self._do_logout()
        url = "/api/notifications/"
        data = {"notifications": notif_ids}
        resp = self.client.put(url, data)

        # assert 403
        self.assertEqual(resp.status_code, 403)

    def test_mark_notifs_as_viewed_for_others(self):
        """
        Assert that a user cannot mark
        another user's notifications as viewed.
        """
        # set up test
        # user 1 creates a post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 comments on user 1's post
        self._do_login(self.test_signer_2)
        self._create_comment(post_id, text="hello")
        self._do_logout()

        # get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)
        notif_ids = [notif['id'] for notif in resp.data["results"]]

        # make request as user 2 to mark user 1's notifications as viewed
        self._do_logout()
        self._do_login(self.test_signer_2)
        url = "/api/notifications/"
        data = {"notifications": notif_ids}
        resp = self.client.put(url, data)

        # assert that user 2 gets a 403
        self.assertEqual(resp.status_code, 403)

    def test_liked_your_post_notifs(self):
        """
        Assert that a user gets a notification when
        another user likes their post.
        """
        # set up test
        # user 1 creates a post
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # user 2 likes user 1's post
        self._do_login(self.test_signer_2)
        url = f"/api/post/{post_id}/likes/"
        resp = self.client.post(url)

        # assert that user 1 received a notification
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)
        notif = resp.data["results"][0]
        event = notif["events"]["likedPostEvent"]
        self.assertEqual(
            event["likedBy"]["address"],
            self.test_signer_2.address
        )

    def test_liked_your_comment_notifs(self):
        """
        Assert that a user gets a notification when
        another user likes their comment.
        """
        # set up test
        # user 1 creates a post and comment
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]
        resp = self._create_comment(post_id, "hello")
        comment_id = resp.data["id"]

        # user 2 likes user 1's comment
        self._do_login(self.test_signer_2)
        url = f"/api/posts/{post_id}/comments/{comment_id}/likes/"
        resp = self.client.post(url)

        # assert that user 1 received a notification
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)
        notif = resp.data["results"][0]
        event = notif["events"]["likedCommentEvent"]
        self.assertEqual(
            event["likedBy"]["address"],
            self.test_signer_2.address
        )
        self.assertEqual(event["comment"], comment_id)
        self.assertEqual(event["post"], post_id)

    def test_repost_notif(self):
        """
        Assert that a user gets a notification when
        another user reposts their post.
        """
        # set up test
        # create post by user 1
        self._do_login(self.test_signer)
        resp = self._create_post()
        post_id = resp.data["id"]

        # repost user1's post by user2
        self._do_login(self.test_signer_2)
        resp = self._repost(post_id)
        repost_id = resp.data["id"]

        # make request to get user 1's notifications
        self._do_login(self.test_signer)
        url = "/api/notifications/"
        resp = self.client.get(url)

        # assert that user 1 has a notification for the repost
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)
        notification = resp.data["results"][0]
        event = notification["events"]["repostEvent"]
        self.assertEqual(event["repost"], repost_id)
        self.assertEqual(
            event["repostedBy"]["address"],
            self.test_signer_2.address
        )


class AlchemyWebhookTests(BaseTest):
    """
    Tests behavior around the webhook for Alchemy Notify.
    """

    def test_unauthed_request(self):
        """
        Assert that an unauthenticated webhook requests fails.
        """
        # set up test
        url = "/api/alchemy-notify-webhook/"
        data={"fakekey":"fakeval"}
        extra_headers = {"HTTP_X-Alchemy-Signature": "wrong-sig"}

        # make request
        resp = self.client.post(
            url,
            data=data,
            **extra_headers
        )

        # make assertions
        self.assertEqual(resp.status_code, 403)

    def test_notify_wh_adds_job_on_rq(self):
        """
        Assert that a successfully authenticated webhook
        request is added to a redis queue for
        processing by one of the workers.
        """
        # set up test
        url = "/api/alchemy-notify-webhook/"
        data={"fakekey":"fakeval"}
        body = json.dumps(data).replace(" ", "")
        valid_sig = get_expected_alchemy_sig(body)
        extra_headers = {"HTTP_X-Alchemy-Signature": valid_sig}

        # make request
        resp = self.client.post(
            url,
            data=data,
            **extra_headers
        )

        # make assertions
        self.assertEqual(resp.status_code, 200)
        queue = rq.Queue(connection=self.redis_backend, name="tx_processing")
        self.assertEqual(len(queue), 1)

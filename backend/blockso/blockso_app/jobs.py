# std lib imports
import datetime
import json

# third party imports
from django.conf import settings
from django.contrib.auth import get_user_model
from web3 import Web3
import redis
import requests
import rq

# our imports
from .models import ERC20Transfer, ERC721Transfer, Feed, Post, \
                    Profile, Transaction 
UserModel = get_user_model()


# client config
api_key = settings.COVALENT_API_KEY
base_url = "https://api.covalenthq.com/v1"
client = requests.Session()
chain_id = 1

# known log signatures
erc20_transfer_sig = "Transfer(indexed address from, "\
                     "indexed address to, uint256 value)"
erc721_transfer_sig = "Transfer(indexed address from, "\
                     "indexed address to, indexed uint256 tokenId)"

# other constants
zero_address = "0x0000000000000000000000000000000000000000"
scheduled_job_name = "queue_tx_history_job_for_all_users"


def _get_redis_queue():
    """
    Return an rq queue connected to a redis backend.
    This creates a new connection every time it's called,
    so be careful calling it.
    DO NOT call this method from outside this module.
    If you need to do that, then figure out a way to
    create / use a singleton for uses outside this module.
    """
    redis_client = redis.from_url(settings.REDIS_URL)
    return rq.Queue(connection=redis_client)


def enqueue_all_users_tx_history(limit):
    """
    Enqueues a job for all users in the system that:
     - have an account that has logged in OR
     - are being followed OR
     - are part of a Feed
    to fetch their tx history and update the db.
    limit is the number of transactions to fetch.
    If limit is None then it fetches all txs.
    """
    # redis client and queue for scheduling jobs
    redis_queue = _get_redis_queue()

    # fetch the union of users that have logged in or
    # have followers or are part of a Feed
    logged_in = Profile.objects.all().exclude(user__last_login=None)
    have_followers = Profile.objects.all().exclude(follow_dest=None)
    on_feed = Profile.objects.filter(feed__in=Feed.objects.all())
    profiles = logged_in | have_followers | on_feed

    # queue a job to get the tx history of each user 
    for profile in profiles:
        redis_queue.enqueue(
            process_address_txs,
            profile.user.ethereum_address,
            limit,
            job_id=profile.user.ethereum_address
        )

def _handle_scheduling_all_users_job(next_update):
    """
    Schedules the job that's responsible for queueing
    individual jobs for getting all users' tx history.
    Schedules the job to run at the 'next_update_at' date.
    Does nothing if the job is already scheduled.
    """
    # redis client and queue for scheduling jobs
    redis_queue = _get_redis_queue()
    scheduled_jobs = rq.registry.ScheduledJobRegistry(queue=redis_queue)

    # transform data from covalent to a datetime
    next_update = datetime.datetime.fromisoformat(
        next_update[0:-4] + "+00:00"
    )

    # schedule the job
    result = redis_queue.enqueue_at(
        next_update,
        enqueue_all_users_tx_history,
        50,
        job_id=scheduled_job_name
    )


def get_tx_history_url(address, page_number):
    """
    Return URL for getting tx history of given address.
    """
    url = f"{base_url}/{chain_id}/address/{address}/"\
          f"transactions_v2/?key={api_key}"\
          f"&quote-currency=USD&format=JSON&block-signed-at-asc=false"\
          f"&no-logs=false&page-number={page_number}&page-size=100"

    return url


def get_user_tx_history(address, limit):
    """
    Use the covalent API to get the previous X
    transactions of the given address.
    If 'limit' is None then all transactions are returned,
    otherwise only 'limit' number of txs are returned.
    Returns a list of transactions data.
    """
    # TODO can this run out of memory if
    # there are thousands of txs?
    to_ret = []

    # paginate through results
    has_more = True
    page_number = -1
    while has_more is True:
        # prepare url
        page_number += 1
        url = get_tx_history_url(address, page_number)

        # make request for txs
        resp = client.get(url)
        resp.raise_for_status()
        data = resp.json()

        # update results
        to_ret += data["data"]["items"]
        has_more = data["data"]["pagination"]["has_more"]

        # schedule a job to update tx history of all users
        # when covalent next updates its data
        next_update = data["data"]["next_update_at"]
        _handle_scheduling_all_users_job(next_update)

        # stop looping if limit has been reached
        if limit is not None and len(to_ret) >= limit:
            break

        # TODO remove this when a more robust tx indexing system is created
        # for now break after 10 pages, to avoid overwhelming covalent
        # and our job system
        if page_number == 10: break

    return to_ret


def parse_and_create_tx(tx_data, address):
    """
    Parses transaction data and stores it in the database.
    Returns the created Transaction object.
    Returns None if the transaction:
     - does not originate from the given address, or
     - the transaction already exists in the db.
    """
    tx = None
    address = address.lower()

    # data for creating new tx
    object_kwargs = {
        "chain_id": chain_id,
        "tx_hash": tx_data["tx_hash"],
        "block_signed_at": tx_data["block_signed_at"],
        "tx_offset": tx_data["tx_offset"],
        "successful": tx_data["successful"],
        "from_address": tx_data["from_address"],
        "to_address": tx_data["to_address"],
        "value": tx_data["value"]
    }

    # return None if transaction already exists
    if Transaction.objects.filter(
        tx_hash=object_kwargs["tx_hash"]
    ).count() > 0:
        return None

    # return if the given address is not the origin of the tx
    # this helps avoid spam until there's a better system in place
    if object_kwargs["from_address"] != address:
        return None

    # recipient in contract creation txs comes back as None,
    # set it to zero address instead
    if object_kwargs["to_address"] is None:
        object_kwargs["to_address"] = zero_address

    # create tx
    tx = Transaction.objects.create(**object_kwargs)

    # create db records for the events we support
    log_events = tx_data["log_events"]
    for event in log_events:
        # skip logs that havent been decoded by covalent
        if event["decoded"] is None:
            continue

        # create records for erc20 transfers
        event_sig = event["decoded"]["signature"]
        if event_sig == erc20_transfer_sig:
            ERC20Transfer.objects.create(
                tx=tx,
                contract_address=event["sender_address"],
                contract_name=event["sender_name"],
                contract_ticker=event["sender_contract_ticker_symbol"],
                logo_url=event["sender_logo_url"],
                from_address=event["decoded"]["params"][0]["value"],
                to_address=event["decoded"]["params"][1]["value"],
                amount=event["decoded"]["params"][2]["value"],
                decimals=event["sender_contract_decimals"]
            )

        # create records for erc721 transfers
        if event_sig == erc721_transfer_sig:
            ERC721Transfer.objects.create(
                tx=tx,
                contract_address=event["sender_address"],
                contract_name=event["sender_name"],
                contract_ticker=event["sender_contract_ticker_symbol"],
                logo_url=event["sender_logo_url"],
                from_address=event["decoded"]["params"][0]["value"],
                to_address=event["decoded"]["params"][1]["value"],
                token_id=event["decoded"]["params"][2]["value"],
            )

    return tx


def create_post(tx_record, post_author):
    """
    Creates a Post using a db record of Transaction where the
    post_author is the from address of the transaction.
    Returns the created object.
    Returns None if the post_author is not the originator of the
    transaction. 
    """
    # Post details that remain the same
    object_kwargs = {
        "text": "",
        "imgUrl": "",
        "isShare": False,
        "isQuote": False,
        "refPost": None
    }
    address = post_author.user.ethereum_address.lower()

    # create Post if author is the sender of the tx
    if tx_record.from_address == address:
        return Post.objects.create(
            author=post_author,
            refTx=tx_record,
            created=tx_record.block_signed_at,
            **object_kwargs
        )

    return None


def process_address_txs(address, limit=None):
    """
    Populates the database with the address' transaction history.
    Creates Posts based on the tx history.
    Processes all txs if 'limit' is None, otherwise processes
    'limit' number of transactions.
    """
    # get tx history
    history = get_user_tx_history(address, limit)

    # create a user/profile if they do not already exist
    user, _ = UserModel.objects.get_or_create(ethereum_address=address)
    user, _ = Profile.objects.get_or_create(user=user)

    # create db records based on history
    for transaction in history:
        # create a Transaction using the tx data
        tx_record = parse_and_create_tx(transaction, address)

        # exit if the tx has been processed before
        if tx_record is None:
            continue

        # create a Post using the tx data
        create_post(tx_record, user)

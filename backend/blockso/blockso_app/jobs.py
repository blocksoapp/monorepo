# std lib imports
import json

# third party imports
from django.conf import settings
from django.contrib.auth import get_user_model
from web3 import Web3
import requests

# our imports
from .models import ERC20Transfer, ERC721Transfer, Post, Profile, Transaction 
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


def get_tx_history_url(address, page_size, page_number):
    """
    Return URL for getting tx history of given address.
    """
    url = f"{base_url}/{chain_id}/address/{address}/"\
          f"transactions_v2/?key={api_key}"\
          f"&quote-currency=USD&format=JSON&block-signed-at-asc=false"\
          f"&no-logs=false&page-number={page_number}&page-size={page_size}"

    return url


def get_user_tx_history(address, limit=None):
    """
    Use the covalent API to get the previous X
    transactions of the given address.
    If limit is given, then that number
    of transactions is returned. Otherwise all
    transactions are returned.
    Returns a list of transactions data.
    """
    # TODO can this run out of memory if
    # there are thousands of txs?
    to_ret = []
    page_size = 500 if limit is None else limit

    # paginate through results
    has_more = True
    page_number = -1
    while has_more is True:
        # prepare url
        page_number += 1
        url = get_tx_history_url(address, page_size, page_number)

        # make request for txs
        resp = client.get(url)
        resp.raise_for_status()
        data = resp.json()

        # update results
        to_ret += data["data"]["items"]
        has_more = data["data"]["pagination"]["has_more"]

    return to_ret


def parse_and_create_tx(tx_data, address):
    """
    Parses transaction data and stores it in the database.
    Returns the created Transaction object.
    Returns None if the transaction:
     - does not originate from the given address, or
     - does not have any transfers that originate from
       the given address, or
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

    # create transaction if it originated from the given address
    if object_kwargs["from_address"] == address:
        tx = Transaction.objects.create(**object_kwargs)

    # create db records for the events we support
    log_events = tx_data["log_events"]
    for event in log_events:
        # skip logs that havent been decoded by covalent
        if event["decoded"] is None:
            continue

        # create an erc20 transfer record if
        # the from address in the log matches that of the sender
        event_sig = event["decoded"]["signature"]
        if event_sig == erc20_transfer_sig and \
            event["decoded"]["params"][0]["value"] == address:

            if tx is None:
                tx, _ = Transaction.objects.get_or_create(**object_kwargs)

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

        # create an erc721 transfer record if
        # the from address in the log matches that of the sender
        if event_sig == erc721_transfer_sig and \
            event["decoded"]["params"][0]["value"] == address:

            if tx is None:
                tx, _ = Transaction.objects.get_or_create(**object_kwargs)

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
    Creates a Post using a db record of Transaction, ERC20Transaction,
    or ERC721Transaction, where the post_author is the from address
    of the transaction or transfer.
    Returns the created object.
    Returns None if the post_author is not the originator of the
    transaction or transfer(s).
    """
    # Post details that remain the same
    object_kwargs = {
        "text": "",
        "imgUrl": "",
        "isShare": False,
        "isQuote": False,
        "refPost": None
    }
    address = post_author.ethereum_address.lower()

    # create Post if author is the sender of the tx
    if tx_record.from_address == address:
        return Post.objects.create(
            author=post_author,
            refTx=tx_record,
            created=tx_record.block_signed_at,
            **object_kwargs
        )

    # create Post if author is the sender of an erc20 transfer in the tx
    for transfer in tx_record.erc20_transfers.all():
        if transfer.from_address == address:
            return Post.objects.create(
                author=post_author,
                refTx=tx_record,
                created=tx_record.block_signed_at,
                **object_kwargs
            )

    # create Post if author is the sender of an erc721 transfer in the tx
    for transfer in tx_record.erc721_transfers.all():
        if transfer.from_address == address:
            return Post.objects.create(
                author=post_author,
                refTx=tx_record,
                created=tx_record.block_signed_at,
                **object_kwargs
            )

    return None

def process_address_txs(address):
    """
    Populates the database with the address' transaction history.
    Creates Posts based on the tx history.
    Exits once it starts processing existing txs.
    """
    # get tx history
    history = get_user_tx_history(address)

    # create a user/profile if they do not already exist
    user, _ = UserModel.objects.get_or_create(ethereum_address=address)
    Profile.objects.get_or_create(user=user)

    # create db records based on history
    for transaction in history:
        # create a Transaction using the tx data
        tx_record = parse_and_create_tx(transaction, address)

        # exit if the tx has been processed before
        if tx_record is None:
            continue

        # create a Post using the tx data
        create_post(tx_record, user)

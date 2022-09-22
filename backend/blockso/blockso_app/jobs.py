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


def get_tx_history_url(address):
    """
    Return URL for getting tx history of given address.
    """
    url = f"{base_url}/{chain_id}/address/{address}/"\
          f"transactions_v2/?key={api_key}"\
          f"&quote-currency=USD&format=JSON&block-signed-at-asc=false"\
          f"&no-logs=false&page-number=0&page-size=20"

    return url


def get_user_tx_history(address):
    """
    Use the covalent API to get the previous 50
    transactions of the given address.
    Returns a list of transactions data.
    """
    url = get_tx_history_url(address)
    resp = client.get(url) 
    data = resp.json()
    txs = data["data"]["items"]

    return txs


def parse_and_create_tx(tx_data):
    """
    Parses transaction data and stores it in the database.
    Returns the created object.
    Returns None if the transaction already exists in the database.
    """
    # create Transaction object using the transaction data
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
    tx, created = Transaction.objects.get_or_create(**object_kwargs)

    # return None if the transaction already exists in the db
    if created is False:
        return None

    # create db records for the events we support
    log_events = tx_data["log_events"]
    for event in log_events:
        # skip logs that havent been decoded by covalent
        if event["decoded"] is None:
            continue

        # create an erc20 transfer record
        if event["decoded"]["signature"] == erc20_transfer_sig:
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

        # create an erc721 transfer record
        if event["decoded"]["signature"] == erc721_transfer_sig:
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
    or ERC721Transaction.
    Returns the created object.
    """
    # Post details that remain the same
    object_kwargs = {
        "text": "",
        "imgUrl": "",
        "isShare": False,
        "isQuote": False,
        "refPost": None
    }

    return Post.objects.create(
        author=post_author,
        refTx=tx_record,
        created=tx_record.block_signed_at,
        **object_kwargs
    )

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
        tx_record = parse_and_create_tx(transaction)

        # exit if the tx has been processed before
        if tx_record is None:
            break

        # create a Post using the tx data
        create_post(tx_record, user)

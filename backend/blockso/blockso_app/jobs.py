# std lib imports

# third party imports
from django.conf import settings
from django.contrib.auth import get_user_model
from web3 import Web3
import requests

# our imports
from .models import ERC20Transfer, ERC721Transfer, Post, Profile, Transaction 


api_key = settings.COVALENT_API_KEY
base_url = "https://api.covalenthq.com/v1"
client = requests.Session()
chain_id = 1
UserModel = get_user_model()


def get_tx_history_url(address):
    """
    Return URL for getting tx history of given address.
    """
    url = f"{base_url}/{chain_id}/address/{address}/"\
          f"transactions_v2/?key={api_key}"\
          f"&quote-currency=USD&format=JSON&block-signed-at-asc=false"\
          f"&no-logs=false&page-number=0&page-size=50"

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

    # return created tx if it is not an erc20/erc721 transfer
    log_events = tx_data["log_events"]
    if len(log_events) != 1:
        return tx

    event = log_events[0]
    if event["decoded"]["name"] != "Transfer":
        return tx

    # create and return an erc20 transfer record
    if event["decoded"]["params"][2]["name"] == "value":
        return ERC20Transfer.objects.create(
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

    # create and return an erc721 transfer record
    if event["decoded"]["params"][2]["name"] == "tokenId":
        return ERC721Transfer.objects.create(
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
    # Post details that remain the same no matter the tx_record type
    object_kwargs = {
        "imgUrl": "",
        "isShare": False,
        "isQuote": False,
        "refPost": None
    }

    # handle Transaction
    if isinstance(tx_record, Transaction):
        text = f"{tx_record.from_address} sent a tx to "\
               f"{tx_record.to_address}."
        return Post.objects.create(
            author=post_author,
            text=text,
            refTx=tx_record,
            created=tx_record.block_signed_at,
            **object_kwargs
        )

    # handle ERC20Transfer
    elif isinstance(tx_record, ERC20Transfer):

        # format amount of tokens sent or received
        amount = tx_record.amount
        decimals = tx_record.decimals
        if len(amount) <= decimals:
            amount = ("0" * (decimals - len(amount) + 1)) + amount
        pre_dot = amount[:decimals * -1]
        post_dot = amount[decimals:]
        amount = f"{pre_dot}.{post_dot}"

        # format text of post
        text = f"{tx_record.from_address} sent {amount} "\
               f"{tx_record.contract_ticker} to "\
               f"{tx_record.to_address}."

        return Post.objects.create(
            author=post_author,
            text=text,
            refTx=tx_record.tx,
            created=tx_record.tx.block_signed_at,
            **object_kwargs
        )

    # handle ERC721Transfer
    elif isinstance(tx_record, ERC721Transfer):
        text = f"{tx_record.from_address} sent "\
               f"{tx_record.contract_ticker} #{tx_record.token_id} to "\
               f"{tx_record.to_address}."
        
        return Post.objects.create(
            author=post_author,
            text=text,
            refTx=tx_record.tx,
            created=tx_record.tx.block_signed_at,
            **object_kwargs
        )

    else:
        raise Exception("Unhandled tx_record type: %s" % tx_record)


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

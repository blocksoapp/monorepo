# std lib imports
import datetime

# third party imports
from django.conf import settings
from django.contrib.auth import get_user_model
from web3.constants import ADDRESS_ZERO

# our imports
from ..models import ERC20Transfer, ERC721Transfer, Post, Profile, Transaction 
from ..web3_client import w3
from .abis import erc20_abi, erc721_abi


UserModel = get_user_model()


def _create_tx(data):
    """
    Creates a Transaction based on the given data.
    """
    object_kwargs = {
        "chain_id": 1,
        "tx_hash": data["hash"],
        "from_address": None,
        "to_address": None,
        "block_signed_at": None,
        "value": None
    }

    # get block timestamp
    block_num = w3.toInt(hexstr=data["blockNum"])
    timestamp = w3.eth.get_block(block_num).timestamp
    object_kwargs["block_signed_at"] = datetime.datetime.fromtimestamp(
        timestamp, tz=datetime.timezone.utc
    )

    # get transaction details
    # prefer to use block num and tx index as it costs less alchemy units
    if "log" in data:
        tx_index = w3.toInt(hexstr=data["log"]["transactionIndex"])
        tx = w3.eth.get_transaction_by_block(block_num, tx_index)
    else:
        tx = w3.eth.get_transaction(data["hash"])

    object_kwargs["from_address"] = tx["from"]
    object_kwargs["to_address"] = tx["to"]
    object_kwargs["value"] = tx["value"]

    # create Transaction if it does not exist
    tx, _ = Transaction.objects.get_or_create(**object_kwargs)
    
    return tx


def _create_post(address, tx):
    """
    Creates a Post where the author is the given address,
    and the reference transaction is the given tx.
    Does not create a Post if address is the zero address.
    """
    # do not create posts for zero address
    if address == ADDRESS_ZERO:
        return

    # Post details
    object_kwargs = {
        "text": "",
        "imgUrl": "",
        "isShare": False,
        "isQuote": False,
        "refPost": None,
        "refTx": None,
        "created": None,
        "author": None
    }

    # get or create author based on given address
    user, _ = UserModel.objects.get_or_create(
        ethereum_address=w3.toChecksumAddress(address)
    )
    author, _ = Profile.objects.get_or_create(
        user=user
    )
    object_kwargs["author"] = author

    # set created time
    object_kwargs["created"] = tx.block_signed_at

    # set reference transaction
    object_kwargs["refTx"] = tx

    # get or create Post
    post, _ = Post.objects.get_or_create(**object_kwargs)

    return post


def _create_erc20_transfer(data, tx):
    """
    Creates an ERC20Transfer and Posts based on the given data.
    """
    # prepare ERC20Transfer data
    object_kwargs = {
        "tx": tx,
        "contract_address": data["rawContract"]["address"],
        "contract_ticker": data["asset"],
        "from_address": data["fromAddress"],
        "to_address": data["toAddress"],
        "amount": str(w3.toInt(hexstr=data["log"]["data"])),
        "decimals": data["rawContract"]["decimals"],
        "contract_name": None,
        "logo_url": None,
    }

    # get contract name
    contract = w3.eth.contract(
        w3.toChecksumAddress(object_kwargs["contract_address"]),
        abi=erc20_abi
    )
    object_kwargs["contract_name"] = contract.functions.name().call()

    # get logo of asset
    logo_url = f"https://logos.covalenthq.com/tokens/1/" \
                f"{object_kwargs['contract_address']}.png"
    object_kwargs["logo_url"] = logo_url

    # get or create ERC20Transfer
    transfer, _ = ERC20Transfer.objects.get_or_create(**object_kwargs)

    # create posts for the sender and receiver
    _create_post(transfer.from_address, tx)
    _create_post(transfer.to_address, tx)

    return transfer


def _create_erc721_transfer(data, tx):
    """
    Creates an ERC721Transfer and Posts based on the given data.
    """
    # prepare ERC20Transfer data
    object_kwargs = {
        "tx": tx,
        "contract_address": data["rawContract"]["address"],
        "from_address": data["fromAddress"],
        "to_address": data["toAddress"],
        "token_id": str(w3.toInt(hexstr=data["erc721TokenId"])),
        "contract_ticker": None,
        "contract_name": None,
        "logo_url": None,
    }

    # get contract name
    contract = w3.eth.contract(
        w3.toChecksumAddress(object_kwargs["contract_address"]),
        abi=erc721_abi
    )
    object_kwargs["contract_ticker"] = contract.functions.symbol().call()
    object_kwargs["contract_name"] = contract.functions.name().call()

    # get logo of asset
    logo_url = f"https://logos.covalenthq.com/tokens/" \
                f"{object_kwargs['contract_address']}.png"
    object_kwargs["logo_url"] = logo_url

    # get or create ERC721Transfer
    transfer, _ = ERC721Transfer.objects.get_or_create(**object_kwargs)

    # create posts for the sender and receiver
    _create_post(transfer.from_address, tx)
    _create_post(transfer.to_address, tx)

    return transfer


def _handle_reorged_tx(data):
    """
    Deletes Transaction, transfers, and Posts associated
    with a re-orged transaction.
    """
    tx = Transaction.objects.get(tx_hash=data["hash"])
    Post.objects.filter(refTx=tx).delete()
    tx.delete()


def process_activity(data):
    """
    Creates Transaction, transfers, and Posts based on the given data.
    Deletes Transaction, transfers, and Posts if the transaction was reorged.
    """
    # do nothing on events we do not yet support
    # - internal transfers
    # - erc1155 transfers
    if data["category"] == "internal":
        return

    if data["category"] == "token" and "erc1155Metadata" in data:
        return

    # handle re-orged transaction
    if (data["category"] == "token" and data["log"]["removed"] == True) or \
        (data["category"] == "external" and getattr(data, "removed", False)):
        _handle_reorged_tx(data)
        return

    # create transaction for the events we support
    tx = _create_tx(data)

    # handle external eth transfer
    if data["category"] == "external":
        _create_post(tx.from_address, tx)
        _create_post(tx.to_address, tx)

    # handle erc20 transfer
    if data["category"] == "token" and "asset" in data:
        _create_erc20_transfer(data, tx)

    # handle erc721 transfer
    if data["category"] == "token" and "erc721TokenId" in data:
        _create_erc721_transfer(data, tx)

    return

def process_webhook_data(data):
    """
    Processes the activity items in the given data,
    creating Transactions, Transfers, and Posts.
    """
    for item in data["event"]["activity"]:
        process_activity(item)

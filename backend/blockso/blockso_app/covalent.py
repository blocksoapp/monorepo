"""
Module that contains Covalent related logic.
Exists in addition to `blockso_app.jobs.covalent_jobs`
because the logic is not specific to a job.
"""
# std lib imports

# third party imports
import rq

# local imports
from blockso_app.jobs import covalent_jobs
from blockso_app import redis_client, utils


def should_fetch_tx_history(profile):
    """
    Returns True if the given profile is not being watched
    and there are no jobs fetching their tx history already.
    Returns False otherwise.
    """
    # return False if profile is being watched
    watched = utils.get_profiles_to_watch().filter(pk=profile.pk).exists()
    if watched:
        return False

    # return False if job is queued or finished
    client = redis_client.RedisConnection()
    queue = client.get_high_queue()

    # is job queued already
    if profile.user.ethereum_address in queue.get_job_ids():
        return False

    # is job finished already
    if profile.user.ethereum_address in \
        rq.registry.FinishedJobRegistry(queue=queue):
        return False

    return True


def enqueue_fetch_tx_history(profile):
    """
    Enqueues a job that uses Covalent to fetch the
    tx history of the given profile.
    """
    if should_fetch_tx_history(profile):
        client = redis_client.RedisConnection()
        queue = client.get_high_queue()
        job = queue.enqueue(
            covalent_jobs.process_address_txs,
            profile.user.ethereum_address,
            1000,
            job_id=profile.user.ethereum_address
        )

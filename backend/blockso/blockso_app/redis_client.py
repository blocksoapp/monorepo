"""
Module containing singleton of connection to redis backend.
"""
# std lib imports

# third party imports
from django.conf import settings
import redis
import rq

# our imports


class RedisConnection():
    """ Singleton for redis connection. """

    def __new__(cls):
        if not hasattr(cls, 'instance'):
          cls.instance = super(RedisConnection, cls).__new__(cls)

        return cls.instance

    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)

    def get_high_queue(self):
        return rq.Queue(name='high', connection=self.redis_client)

    def get_tx_processing_queue(self):
        return rq.Queue('tx_processing', connection=self.redis_client)

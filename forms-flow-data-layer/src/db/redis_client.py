import json
import logging
from typing import Any, Dict, Optional

import redis.asyncio as redis

from src.config.envs import ENVS


class RedisCache:
    def __init__(self, redis_url: str):
        print(redis_url)
        self.redis_url = redis_url
        self.redis = None

    async def connect(self):
        """
        Initialize the Redis connection with error handling.
        Automatically called before operations if connection is not established.
        """
        try:
            if self.redis is None:
                self.redis = redis.Redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    # Add connection pool settings
                    max_connections=10,
                    socket_timeout=5,
                    socket_connect_timeout=5,
                )
                # Verify connection
                await self.redis.ping()
                logging.info("Redis connection established successfully")
        except Exception as e:
            logging.error(f"Failed to connect to Redis: {e}")
            self.redis = None
            raise

    async def set_cache(self, key: str, value: Dict[str, Any], expire: int = 60):
        """
        Store data in Redis with an expiration time.
        Ensures connection is established before caching.
        """
        if self.redis is None:
            await self.connect()

        try:
            await self.redis.setex(key, expire, json.dumps(value))
        except Exception as e:
            logging.error(f"Error setting cache for key {key}: {e}")

    async def get_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached data from Redis.
        Ensures connection is established before retrieving.
        """
        if self.redis is None:
            await self.connect()

        try:
            data = await self.redis.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logging.error(f"Error retrieving cache for key {key}: {e}")
            return None

    async def delete_cache(self, key: str):
        """
        Delete a specific cache key.
        """
        if self.redis is None:
            await self.connect()

        try:
            await self.redis.delete(key)
        except Exception as e:
            logging.error(f"Error deleting cache key {key}: {e}")


# Initialize Redis
redis_cache = RedisCache(ENVS.REDIS_URL)

import functools
import hashlib
import logging
from dataclasses import asdict, is_dataclass
from typing import Callable, Optional

import orjson

from src.db.redis_client import redis_cache


def cache_graphql(expire: int = 60, key_prefix: Optional[str] = None):
    """
    Decorator to cache GraphQL query results in Redis.

    Args:
        expire (int): Cache expiration time in seconds.
        key_prefix (str, optional): Custom prefix for cache key.
    """

    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                # Generate cache key based on function arguments
                query_params = {k: v for k, v in kwargs.items() if v is not None}
                param_hash = hashlib.sha256(
                    orjson.dumps(query_params, option=orjson.OPT_SORT_KEYS)
                ).hexdigest()
                cache_key = (
                    f"{key_prefix or 'graphql_cache'}:{func.__name__}:{param_hash}"
                )

                # Attempt to retrieve cached result
                if cached_result := await redis_cache.get_cache(cache_key):
                    data_dict = orjson.loads(cached_result)
                    result_type = func.__annotations__.get("return")
                    # Convert dictionary back to instance(s)
                    if is_dataclass(result_type):
                        return result_type(**data_dict)
                    if isinstance(data_dict, list) and result_type:
                        item_type = getattr(result_type, "__args__", [None])[0]
                        return (
                            [item_type(**item) for item in data_dict]
                            if is_dataclass(item_type)
                            else data_dict
                        )

                    return data_dict  # Default fallback

                # Execute function if cache is empty
                result = await func(*args, **kwargs)

                # Convert result to JSON-serializable format
                if is_dataclass(result):
                    result_json = orjson.dumps(asdict(result)).decode(
                        "utf-8"
                    )  # 🔹 Convert bytes to string
                elif isinstance(result, list) and all(
                    is_dataclass(item) for item in result
                ):
                    result_json = orjson.dumps(
                        [asdict(item) for item in result]
                    ).decode(
                        "utf-8"
                    )  # 🔹 Convert bytes to string
                else:
                    result_json = orjson.dumps(result).decode(
                        "utf-8"
                    )  # 🔹 Convert bytes to string

                # Store result in Redis
                await redis_cache.set_cache(cache_key, result_json, expire)
                return result

            except Exception as e:
                logging.error(f"[Cache Error] {func.__name__}: {e}")
                return await func(*args, **kwargs)

        return wrapper

    return decorator

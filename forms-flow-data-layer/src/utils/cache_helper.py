import functools
import hashlib
import logging
from dataclasses import asdict, is_dataclass
from typing import Any, Callable, Optional

import orjson

from src.db.redis_client import redis_cache


def generate_cache_key(func: Callable, kwargs: dict, key_prefix: Optional[str]) -> str:
    """Generate a unique cache key based on function name and parameters."""
    query_params = {k: v for k, v in kwargs.items() if v is not None}
    param_hash = hashlib.sha256(
        orjson.dumps(query_params, option=orjson.OPT_SORT_KEYS)
    ).hexdigest()
    return f"{key_prefix or 'graphql_cache'}:{func.__name__}:{param_hash}"


def deserialize_result(result_type: Any, cached_data: str):
    """Convert cached JSON string back to appropriate data structure."""
    data_dict = orjson.loads(cached_data)

    if is_dataclass(result_type):
        return result_type(**data_dict)

    if isinstance(data_dict, list) and result_type:
        item_type = getattr(result_type, "__args__", [None])[0]
        return (
            [item_type(**item) for item in data_dict]
            if is_dataclass(item_type)
            else data_dict
        )

    return data_dict


def serialize_result(result: Any) -> str:
    """Convert result into JSON-serializable format."""
    if is_dataclass(result):
        return orjson.dumps(asdict(result)).decode("utf-8")

    if isinstance(result, list) and all(is_dataclass(item) for item in result):
        return orjson.dumps([asdict(item) for item in result]).decode("utf-8")

    return orjson.dumps(result).decode("utf-8")


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
            cache_key = generate_cache_key(func, kwargs, key_prefix)

            try:
                if cached_result := await redis_cache.get_cache(cache_key):
                    return deserialize_result(
                        func.__annotations__.get("return"), cached_result
                    )

                # Execute and store the result
                result = await func(*args, **kwargs)
                await redis_cache.set_cache(cache_key, serialize_result(result), expire)

                return result

            except Exception as e:
                logging.error(f"[Cache Error] {func.__name__}: {e}")
                return await func(*args, **kwargs)

        return wrapper

    return decorator

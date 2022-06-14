"""Cache configurations."""

from flask_caching import Cache

cache = Cache(
    config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 14400}  # 2hours
)

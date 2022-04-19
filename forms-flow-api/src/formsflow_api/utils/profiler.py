"""Utility function for profiling functions."""
import time
from functools import wraps

from flask import current_app


def profiletime(profile_fn):
    """Function to profile time."""

    @wraps(profile_fn)
    def measure_time(*args, **kwargs):
        """Measure the API response time using time module."""
        start_time = time.time()
        result = profile_fn(*args, **kwargs)
        end_time = time.time()
        diff = end_time - start_time

        current_app.logger.info(
            f"API endpoint: {profile_fn.__qualname__} took {diff} seconds"
        )
        return result

    return measure_time

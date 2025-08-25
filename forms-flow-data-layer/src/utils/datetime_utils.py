"""Utility functions for converting datetime objects to string format."""
from functools import singledispatch
from datetime import datetime, timezone


@singledispatch
def convert_datetimes_to_string(obj):
    """Default conversion (non-datetime, non-iterable)."""
    return obj


@convert_datetimes_to_string.register
def _(obj: dict):
    """Convert datetime objects in a dictionary to string format."""
    return {k: convert_datetimes_to_string(v) for k, v in obj.items()}


@convert_datetimes_to_string.register
def _(obj: list):
    """Convert datetime objects in a list, or join list of strings."""
    if all(isinstance(i, str) for i in obj):
        return ", ".join(obj)  # join string lists
    return [convert_datetimes_to_string(i) for i in obj]


@convert_datetimes_to_string.register
def _(obj: datetime):
    """Convert datetime object to ISO string format."""
    # Convert to desired ISO format with milliseconds and 'Z'
    if obj.tzinfo is None:
        # Assume naive datetimes are UTC (standard for databases like MongoDB)
        obj = obj.replace(tzinfo=timezone.utc)
    else:
        # Convert aware datetimes to UTC (handles any timezone correctly)
        obj = obj.astimezone(timezone.utc)
    # Format with milliseconds and 'Z'
    return obj.isoformat(timespec="milliseconds").replace("+00:00", "Z")

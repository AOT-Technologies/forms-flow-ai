""" Utility functions for converting datetime objects to string format."""
from functools import singledispatch
from datetime import datetime

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
    """Convert datetime objects in a list to string format."""
    return [convert_datetimes_to_string(i) for i in obj]

@convert_datetimes_to_string.register
def _(obj: datetime):
    """Convert datetime object to string format."""
    # Convert datetime to string format eg: 04-08-2025, 06:30 AM
    return obj.strftime("%d-%m-%Y, %I:%M %p")

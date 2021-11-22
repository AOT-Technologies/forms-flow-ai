"""Enum User Definition"""
from enum import Enum


class FormProcessMapperStatus(Enum):
    """This enum provides the list of FormProcessMapper Status."""

    Active = "active"
    Inactive = "inactive"

class MetricsState(Enum):
    """This enum provides the list of states of Metrics"""
    CREATED = "created"
    MODIFIED = "modified"

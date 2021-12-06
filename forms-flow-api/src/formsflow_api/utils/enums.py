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


class ApplicationSortingParameters:
    """This enum provides the list of Sorting Parameters."""

    Id = "id"
    Created = "created"
    Name = "applicationName"
    Status = "applicationStatus"
    Modified = "modified"

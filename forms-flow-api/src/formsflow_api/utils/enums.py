"""Enum User Definition"""
from enum import Enum


class FormProcessMapperStatus(Enum):
    """This enum provides the list of FormProcessMapper Status."""

    ACTIVE = "active"
    INACTIVE = "inactive"


class MetricsState(Enum):
    """This enum provides the list of states of Metrics"""

    CREATED = "created"
    MODIFIED = "modified"


class ApplicationSortingParameters:  # pylint: disable=too-few-public-methods
    """This enum provides the list of Sorting Parameters."""

    Id = "id"
    Created = "created"
    Name = "applicationName"
    Status = "applicationStatus"
    Modified = "modified"

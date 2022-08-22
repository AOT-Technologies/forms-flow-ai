"""Enum User Definition."""
from enum import Enum, unique


class FormProcessMapperStatus(Enum):
    """This enum provides the list of FormProcessMapper Status."""

    ACTIVE = "active"
    INACTIVE = "inactive"


class MetricsState(Enum):
    """This enum provides the list of states of Metrics."""

    CREATED = "created"
    MODIFIED = "modified"


class ApplicationSortingParameters:  # pylint: disable=too-few-public-methods
    """This enum provides the list of Sorting Parameters."""

    Id = "id"
    Created = "created"
    Name = "applicationName"
    Status = "applicationStatus"
    Modified = "modified"
    FormName = "formName"


@unique
class FormioRoles(Enum):
    """Roles and corresponding machine names."""

    CLIENT = "formsflowClient"
    REVIEWER = "formsflowReviewer"
    DESIGNER = "administrator"
    ANONYMOUS = "anonymous"
    RESOURCE_ID = "RESOURCE_ID"

    @classmethod
    def contains(cls, item: str) -> bool:
        """Checks if the parameter exists in the enum."""
        return item in [entry.value for entry in cls]


@unique
class DraftStatus(Enum):
    """Draft status and corresponding values."""

    ACTIVE = 1
    INACTIVE = 0


class DraftSortingParameters:  # pylint: disable=too-few-public-methods
    """This enum provides the list of Sorting Parameters."""

    id = "id"
    Created = "created"
    Name = "DraftName"
    Status = "applicationStatus"
    Modified = "modified"
    FormName = "formName"

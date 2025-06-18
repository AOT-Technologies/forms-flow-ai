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
    FormStatus = "status"
    Modified = "modified"
    FormName = "formName"
    visibility= "visibility"
    is_anonymous= "is_anonymous"
    type = "type"
    is_draft = "is_draft"


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


@unique
class FilterStatus(Enum):
    """This enum provides the filter status."""

    ACTIVE = "active"
    INACTIVE = "inactive"


class ProcessSortingParameters:  # pylint: disable=too-few-public-methods
    """This enum provides the list of Sorting Parameters."""

    Name = "name"
    Created = "created"
    Modified= "modified"
    ProcessKey = "processKey"


# Added for data analysis api
@unique
class Service(Enum):
    """Enumerations for database support status."""

    ENABLED = "ENABLED"
    DISABLED = "DISABLED"


@unique
class AIRequestType(Enum):
    """Enumerations for chat bot request type."""

    ASSIST = "ASSIST"
    HELP = "HELP"
    MODIFY = "MODIFY"
    REGENERATE = "REGENERATE"
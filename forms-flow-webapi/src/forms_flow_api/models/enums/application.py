"""This manages application Enums."""

from .base_enum import ExtendedIntEnum


class ApplicationStatus(ExtendedIntEnum):
    """This enum provides the list of application Status."""

    Active = 1, 'Active'
    Inactive = 2, 'Inactive'

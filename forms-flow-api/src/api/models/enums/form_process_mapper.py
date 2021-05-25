"""This manages form process mapper enums."""

from .base_enum import ExtendedEnum


class FormProcessMapperStatus(ExtendedEnum):
    """This enum provides the list of FormProcessMapper Status."""

    Active = "active"
    Inactive = "inactive"

"""This exports all of the base enums used by the application."""

from enum import Enum, IntEnum


class ExtendedEnum(Enum):
    """Extended Enum."""

    @classmethod
    def list(cls):
        """Get list of values."""
        return list(map(lambda c: c.value, cls))


class ExtendedIntEnum(IntEnum):
    """Extended Int Enum."""

    def __new__(cls, value, phrase=""):
        """Customize the value to include phrase."""
        obj = int.__new__(cls, value)
        obj._value_ = value

        obj.phrase = phrase
        return obj

    @classmethod
    def get_phrase(cls, value):
        """Get phrase by value."""
        return cls(value).phrase

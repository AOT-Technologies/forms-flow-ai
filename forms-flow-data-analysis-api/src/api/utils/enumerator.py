"""Module to represent enumerations."""
from enum import Enum, unique


@unique
class Service(Enum):
    """Enumerations for database support status."""

    ENABLED = "ENABLED"
    DISABLED = "DISABLED"

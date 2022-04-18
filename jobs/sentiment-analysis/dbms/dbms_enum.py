"""Module to represent supported database systems."""
from enum import Enum, unique


@unique
class Databse(Enum):
    """Enumerations for supported database systems."""

    POSTGRES = 1
    SQL_SERVER = 2

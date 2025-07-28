import functools
from typing import Generic, List, TypeVar

import strawberry

Item = TypeVar("Item")
@strawberry.type
class PaginationWindow(Generic[Item]):
    """GraphQL type representing a generic set of paginated items."""
    items: List[Item]
    total_count: int


def verify_pagination_params(function):
    """Verifies pagination parameters are valid."""

    @functools.wraps(function)
    def wrapper(*args, **kwargs):
        if (limit := kwargs.get('limit')) and limit < 0:
            raise Exception(f"limit ({limit}) must be greater than 0")
        if (offset := kwargs.get('offset')) and offset < 0:
            raise Exception(f"offset ({offset}) must be greater than 0")
        return function(*args, **kwargs)
    return wrapper
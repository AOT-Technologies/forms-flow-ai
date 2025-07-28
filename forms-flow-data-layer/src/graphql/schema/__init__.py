from typing import Generic, List, TypeVar

import strawberry

from src.graphql.schema.form_schema import FormSchema
from src.graphql.schema.submission_schema import SubmissionSchema

Item = TypeVar("Item")
@strawberry.type
class PaginationWindow(Generic[Item]):
    """GraphQL type representing a generic set of paginated items."""
    items: List[Item]
    total_count: int

__all__ = [
    "FormSchema",
    "PaginationWindow",
    "SubmissionSchema"
]

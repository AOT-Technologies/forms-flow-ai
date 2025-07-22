from typing import List, TypeVar, Generic

import strawberry

from src.graphql.schema.form_schema import (FormSchema)
from src.graphql.schema.submission_schema import (
    PaginatedSubmissionResponse,
    SubmissionDetailsWithSubmissionData,
    SubmissionSchema,
)

# Generic pagination window
Item = TypeVar("Item")
@strawberry.type
class PaginationWindow(Generic[Item]):
    items: List[Item]
    total_count: int

__all__ = [
    "FormSchema",
    "PaginationWindow",
    "SubmissionSchema",
    "SubmissionDetailsWithSubmissionData",
    "PaginatedSubmissionResponse",
]

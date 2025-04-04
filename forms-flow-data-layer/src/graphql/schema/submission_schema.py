"""Managing webapi schemas."""

from typing import List, Optional

import strawberry


@strawberry.type
class SubmissionSchema:
    """
    GraphQL type representing a Application
    This is the external representation of your database model
    """

    id: int
    application_status: str
    task_name: str
    data: Optional[strawberry.scalars.JSON]  # Field to hold arbitrary JSON data


@strawberry.type
class QuerySubmissionsSchema:
    id: int
    created_by: str
    application_status: str
    location: Optional[str]


@strawberry.type
class PaginatedSubmissionResponse:
    submissions: List[QuerySubmissionsSchema]
    total_count: int
    page_no: Optional[int] = None
    limit: Optional[int] = None

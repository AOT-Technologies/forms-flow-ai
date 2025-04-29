"""Managing webapi schemas."""

from typing import List, Optional

import strawberry
from strawberry.scalars import JSON


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
class SubmissionDetailsWithSubmissionData:
    id: int
    created_by: str
    submission_id: str
    application_status: str
    data: Optional[JSON] = (
        None  # this data is the submission data from mongodb or we can pass any json data
    )


@strawberry.type
class PaginatedSubmissionResponse:
    submissions: List[SubmissionDetailsWithSubmissionData]
    total_count: int
    page_no: Optional[int] = None
    limit: Optional[int] = None

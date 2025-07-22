"""Managing webapi schemas."""

from typing import List, Optional

import strawberry
from strawberry.scalars import JSON


@strawberry.type
class SubmissionSchema:
    """
    GraphQL type representing a Submission
    This is the external representation of your database model
    """

    # WebAPI populated fields 
    id: int
    application_status: str
    form_id: str
    submission_id: str
    created_at: str
    updated_at: str
    created_by: str
    updated_by: str
    is_resubmit: bool
    is_draft: bool

    # FormIO populated fields
    data: Optional[strawberry.scalars.JSON]  # Field to hold arbitrary JSON data

    # BPM populated fields
    # None

    # Calculated fields
    # None

    @staticmethod
    def from_result(result: dict):
        formio = result["formio"]
        webapi = result["webapi"]
        return SubmissionSchema(
            id=webapi.id,
            application_status=webapi.application_status,
            form_id=webapi.latest_form_id,
            submission_id=webapi.submission_id,
            created_at=(webapi.created.isoformat() if webapi.created else None),
            updated_at=(webapi.modified.isoformat() if webapi.modified else None),
            created_by=webapi.created_by,
            updated_by=webapi.modified_by,
            is_resubmit=webapi.is_resubmit,
            is_draft=webapi.is_draft,
            data=formio.data
        )


@strawberry.type
class SubmissionDetailsWithSubmissionData:
    id: int
    created_by: str
    submission_id: str
    form_name: str
    application_status: str
    created: str
    data: Optional[JSON] = (
        None  # this data is the submission data from mongodb or we can pass any json data
    )


@strawberry.type
class PaginatedSubmissionResponse:
    submissions: List[SubmissionDetailsWithSubmissionData]
    total_count: int
    page_no: Optional[int] = None
    limit: Optional[int] = None

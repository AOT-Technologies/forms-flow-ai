"""Managing webapi schemas."""

from typing import Optional

import strawberry


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
        data = {}

        # Map WebAPI data
        if webapi := result.get("webapi"):
            data.update({
                "id": webapi.id,
                "application_status": webapi.application_status,
                "form_id": webapi.latest_form_id,
                "submission_id": webapi.submission_id,
                "created_at": (webapi.created.isoformat() if webapi.created else None),
                "updated_at": (webapi.modified.isoformat() if webapi.modified else None),
                "created_by": webapi.created_by,
                "updated_by": webapi.modified_by,
                "is_resubmit": webapi.is_resubmit,
                "is_draft": webapi.is_draft
            })
        
        # Map FormIO data
        if formio := result.get("formio"):
            data.update({
                "data": formio.data
            })

        return SubmissionSchema(**data) if data else None

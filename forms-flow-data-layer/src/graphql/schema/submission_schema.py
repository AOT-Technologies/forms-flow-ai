"""Managing webapi schemas."""

import strawberry
from typing import Optional

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
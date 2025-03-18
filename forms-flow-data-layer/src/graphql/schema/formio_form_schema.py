from typing import Optional

import strawberry

from src.middlewares.role_check import RoleCheck


@strawberry.type
class FormSchema:
    """
    GraphQL type representing a Form
    This is the external representation of your database model
    """

    id: str
    name: Optional[str] = strawberry.field(
        extensions=[RoleCheck(["designer"])]
    )  # Add this line
    title: str
    path: str
    type: str
    display: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

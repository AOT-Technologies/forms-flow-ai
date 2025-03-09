from typing import Optional

import strawberry


@strawberry.type
class FormSchema:
    """
    GraphQL type representing a Form
    This is the external representation of your database model
    """

    id: str
    name: str
    title: str
    path: str
    type: str
    display: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

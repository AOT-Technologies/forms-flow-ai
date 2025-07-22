from typing import Any, Optional

import strawberry

from src.middlewares.auth import IsAdmin


@strawberry.type
class FormSchema:
    """
    GraphQL type representing a Form
    This is the external representation of your database model
    """

    # FormIO populated fields
    id: str
    title: str
    name: Optional[str] = strawberry.field(permission_classes=[IsAdmin])
    path: str
    type: str
    display: Optional[str] = None
    parent_form_id: Optional[str] = None
    created_at: Optional[str] = None
    modified_at: Optional[str] = None

    # WebAPI populated fields 
    created_by: str
    modified_by: str
    status: str
    version: int

    # BPM populated fields
    # None

    # Calculated fields
    total_submissions: int

    @staticmethod
    def from_result(result: dict):
        formio = result["formio"]
        webapi = result["webapi"]
        calculated = result["calculated"]
        return FormSchema(
            id=formio.id,
            title=formio.title,
            name=formio.name,
            path=formio.path,
            type=formio.type,
            display=formio.display,
            parent_form_id=formio.parentFormId,
            created_at=(formio.created.isoformat() if formio.created else None),
            modified_at=(formio.modified.isoformat() if formio.modified else None),
            created_by=webapi.created_by,
            modified_by=webapi.modified_by,
            status=webapi.status,
            version=webapi.version,
            total_submissions=calculated["total_submissions"]
        )

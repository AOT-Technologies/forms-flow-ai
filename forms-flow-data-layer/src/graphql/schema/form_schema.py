from typing import Optional

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
    created: Optional[str] = None
    modified: Optional[str] = None

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
        data = {}

        # Map FormIO Data
        if formio:= result.get("formio"):
            data.update({
                "id": formio.id,
                "title": formio.title,
                "name": formio.name,
                "path": formio.path,
                "type": formio.type,
                "display": formio.display,
                "parent_form_id": formio.parentFormId,
                "created": (formio.created.isoformat() if formio.created else None),
                "modified": (formio.modified.isoformat() if formio.modified else None),
            })
        
        # Map WebAPI data
        if webapi := result.get("webapi"):
            data.update({
                "created_by": webapi.created_by,
                "modified_by": webapi.modified_by,
                "status": webapi.status,
                "version": webapi.version,
            })
        
        # Map Calculated data
        if calculated := result.get("calculated"):
            data.update({
                "total_submissions": calculated["total_submissions"]
            })

        return FormSchema(**data)

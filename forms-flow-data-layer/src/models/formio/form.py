from typing import Optional

from beanie import Document

from .constants import FormioTables

# currently this file is not used in the codebase, but it is kept for future use


class FormModel(Document):
    title: str
    name: str
    path: str
    type: str
    isBundle: Optional[bool]
    display: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Settings:
        name = FormioTables.FORMS.value

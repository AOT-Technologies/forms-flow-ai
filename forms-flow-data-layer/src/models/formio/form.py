from typing import Optional

from beanie import Document


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
        name = "forms"

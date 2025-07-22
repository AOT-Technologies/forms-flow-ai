from datetime import datetime
from typing import Optional

from beanie import Document

from .constants import FormioTables


class Form(Document):
    title: str
    name: str
    path: str
    type: str
    isBundle: bool
    display: Optional[str] = None    
    created: Optional[datetime] = None
    modified: Optional[datetime] = None
    parentFormId: Optional[str] = None

    class Settings:
        name = FormioTables.FORMS.value

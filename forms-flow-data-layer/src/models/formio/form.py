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

    @classmethod
    async def count(cls, **filters):
        """Count number of entries that match the passed filters."""
        query = cls.find_all()
        for filter, value in filters.items():
            if hasattr(cls, filter):
                query = query.find(getattr(cls, filter) == value)
        return (await query.count())

from typing import Any, Dict, List, Optional

from beanie import Document, PydanticObjectId
from bson import ObjectId

from .constants import FormioTables


class Submission(Document):
    data: dict
    form: PydanticObjectId

    class Settings:
        name = FormioTables.SUBMISSIONS.value

    @classmethod
    async def count(cls, filters):
        """Count number of entries that match the passed filters."""
        query = cls.find_all()
        for filter, value in filters.items():
            if hasattr(cls, filter):
                query = query.find(getattr(cls, filter) == value)
        return (await query.count())

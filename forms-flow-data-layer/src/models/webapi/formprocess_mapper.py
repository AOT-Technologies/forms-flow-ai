from src.db.webapi_db import webapi_db

from .base import BaseModel
from .constants import WebApiTables


class FormProcessMapper(BaseModel):
    """
    FormProcessMapper class to handle mapper-related information.
    """

    _mapper = None  # cache for the mapper table

    @classmethod
    async def get_table(cls):
        if cls._mapper is None:
            cls._mapper = await webapi_db.get_table(
                WebApiTables.FORM_PROCESS_MAPPER.value
            )
        return cls._mapper

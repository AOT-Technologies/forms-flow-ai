from src.db.webapi_db import webapi_db

from .base import BaseModel
from .constants import WebApiTables

class FormProcessMapper(BaseModel):
    """
    FormProcessMapper class to handle mapper-related information.
    """

    _table_name = WebApiTables.FORM_PROCESS_MAPPER.value
    _table = None  # cache for the mapper table


from src.db.webapi_db import webapi_db

from .base import BaseModel


class FormProcessMapper(BaseModel):
    """
    FormProcessMapper class to handle mapper-related information.
    """

    _table_name = "form_process_mapper"
    _table = None  # cache for the mapper table


from datetime import datetime

from .base import BaseModel
from .constants import WebApiTables


class FormProcessMapper(BaseModel):
    """
    FormProcessMapper class to handle mapper-related information.
    """

    _table_name = WebApiTables.FORM_PROCESS_MAPPER.value
    _table = None  # cache for the mapper table

    @classmethod
    async def first(cls, **filters):
        return await super().first(**filters)
    
    @classmethod
    async def find_all(cls, **filters):
        query = await super().find_all(**filters)
        table = await cls.get_table()

        # Apply date filters, if any
        if (order_by := filters.get("order_by")) and hasattr(table.c, order_by):
            query = query.order_by(order_by)
            if from_date := filters.get("from_date"):
                query = query.where(getattr(table.c, order_by) >= datetime.fromisoformat(from_date))
            if to_date := filters.get("to_date"):
                query = query.where(getattr(table.c, order_by) <= datetime.fromisoformat(to_date))

        return query

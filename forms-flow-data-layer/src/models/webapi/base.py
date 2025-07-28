from sqlalchemy import select
from sqlalchemy.sql import func

from src.db.webapi_db import webapi_db


class BaseModel:
    """Base class for webapi session management."""

    _webapi_session = None  # Class-level cache

    @classmethod
    async def _get_session(cls):
        """Returns the webapi session object."""
        if cls._webapi_session is None:
            cls._webapi_session = await webapi_db.get_session()
        return cls._webapi_session

    @classmethod
    async def execute(cls, query):
        """
        Executes a given SQLAlchemy query using the webapi session.
        """
        async with webapi_db.get_session() as session:
            return await session.execute(query)

    @classmethod
    async def get_table(cls):
        """Gets and caches a SQLAlchemy table."""
        if cls._table is None:
            cls._table = await webapi_db.get_table(cls._table_name)
        return cls._table

    @classmethod
    async def count(cls, **filters):
        """Count number of entries that match the passed filters."""
        stmt = await cls.find_all(**filters)
        return (await cls.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
   
    @classmethod
    async def first(cls, **filters):
        """Find the first entries that match the passed filters."""
        stmt = await cls.find_all(**filters)
        return (await cls.execute(stmt)).first()

    @classmethod
    async def find_all(cls, **filters):
        """Find all entries that match the passed filters."""
        table = await cls.get_table()
        stmt = select(table)
        for key, value in filters.items():
            if hasattr(table.c, key):
                stmt = stmt.where(getattr(table.c, key) == value)
        return stmt

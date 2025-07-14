from src.db.webapi_db import webapi_db


class BaseModel:
    """Base class for webapi session management."""

    _webapi_session = None  # Class-level cache

    @classmethod
    async def _get_session(cls):
        """
        Returns the webapi session object.
        """
        if cls._webapi_session is None:
            cls._webapi_session = await webapi_db.get_session()
        return cls._webapi_session

    @classmethod
    async def execute(cls, query):
        """
        Executes a given SQLAlchemy query using the webapi session.
        """
        session = await cls._get_session()
        return await session.execute(query)

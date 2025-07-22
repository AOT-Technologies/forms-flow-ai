from typing import Generic, List, TypeVar

from src.utils import get_logger

logger = get_logger(__name__)
MongoModel = TypeVar("MongoModel")
PostgresModel = TypeVar("PostgresModel")


class BaseService():
    @staticmethod
    async def _formio_find_all(
        model: Generic[MongoModel],
        limit: int = None,
        offset: int = None,
        filters: dict = None
    ) -> List[MongoModel]:
        query = model.find_all()
        
        # Apply filters
        for filter, value in filters.items():
            if hasattr(model, filter):
                query = query.find(getattr(model, filter) == value)
        total_count = await query.count()

        # Apply pagination
        results = query.skip(offset).limit(limit)
        return results, total_count

    @staticmethod
    async def _webapi_find_all(
        model: Generic[PostgresModel],
        limit: int = None,
        offset: int = None,
        filters: dict = None
    ) -> List[PostgresModel]:
        query = await model.find_all(**filters)
        total_count = len((await model.execute(query)).all())

        # Apply pagination
        results = (await model.execute(query.offset(offset).limit(limit)))
        return results, total_count

from typing import Any, Dict, List, Optional, Tuple

from beanie import PydanticObjectId

from src.graphql.schema import PaginationWindow, SubmissionSchema
from src.graphql.service import BaseService
from src.models.formio import Submission
from src.models.webapi import Application
from src.utils import get_logger

logger = get_logger(__name__)


class SubmissionService(BaseService):
    """Service class for handling submission related operations on mongo and webapi side."""

    @classmethod
    async def get_submissions(
        cls,
        limit: int = 100,
        offset: int = 0,
        filters: dict[str, str] = {},
    ) -> PaginationWindow[SubmissionSchema]:
        """
        Fetches submissions from the WebAPI and adds additional details from FormIO.

        Args:
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            filters (dict): Search filters to apply to the query
        Returns:
            Paginated list of Submission objects containing combined PostgreSQL and MongoDB data
        """
        # Query webapi database
        webapi_query, webapi_total_count = await cls._webapi_find_all(Application, limit, offset, filters)

        # Combine results with data from formio
        results = []
        webapi_results = webapi_query.all()
        for wr in webapi_results:
            results.append({
                "webapi": wr,
                "formio": await Submission.get(PydanticObjectId(wr.submission_id)),
            })

        # Convert to GraphQL Schema
        submissions = [SubmissionSchema.from_result(result=r) for r in results]
        return PaginationWindow(items=submissions, total_count=webapi_total_count)

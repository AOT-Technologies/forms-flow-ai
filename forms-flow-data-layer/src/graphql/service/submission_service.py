from typing import Optional

from beanie import PydanticObjectId

from src.graphql.schema import PaginationWindow, SubmissionSchema
from src.middlewares.pagination import verify_pagination_params
from src.models.formio import Submission
from src.models.webapi import Application
from src.utils import UserContext, get_logger

logger = get_logger(__name__)


class SubmissionService():
    """Service class for handling submission related operations on mongo and webapi side."""

    @classmethod
    @verify_pagination_params
    async def get_submissions(
        cls,
        user_context: UserContext,
        limit: int = 100,
        offset: int = 0,
        filters: dict[str, str] = {},
    ) -> PaginationWindow[SubmissionSchema]:
        """
        Fetches submissions from the WebAPI and adds additional details from FormIO.

        Args:
            user_context (UserContext): User context information
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            filters (dict): Search filters to apply to the query
        Returns:
            Paginated list of Submission objects containing combined PostgreSQL and MongoDB data
        """
        # Query webapi database
        webapi_query = await Application.find_all(**filters)
        webapi_total_count =await Application.count(**filters)

        # Apply pagination filters
        webapi_query = webapi_query.offset(offset).limit(limit)

        # Combine results with data from formio
        results = []
        webapi_results = (await Application.execute(webapi_query)).all()
        for wr in webapi_results:
            results.append({
                "webapi": wr,
                "formio": await Submission.get(PydanticObjectId(wr.submission_id)),
            })

        # Convert to GraphQL Schema
        submissions = [SubmissionSchema.from_result(result=r) for r in results]
        return PaginationWindow(items=submissions, total_count=webapi_total_count)


    @classmethod
    async def get_submission(
        cls,
        user_context: UserContext,
        submission_id: str
    ) -> Optional[SubmissionSchema]:
        """
        Fetches a submission based on it's submission_id from the WebAPI and adds additional details from FormIO.

        Args:
            user_context (UserContext): User context information
            submission_id (str): ID of the submission
        Returns:
            Submission object containing combined PostgreSQL and MongoDB data
        """
        # Query the databases
        webapi_result = await Application.first(submission_id=submission_id)
        formio_result = await Submission.get(PydanticObjectId(submission_id))

        # Combine results
        result = {
            "webapi": webapi_result,
            "formio": formio_result,
        }

        # Convert to GraphQL Schema
        submission = SubmissionSchema.from_result(result=result) 
        return submission


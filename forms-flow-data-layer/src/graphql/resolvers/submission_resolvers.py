from typing import Optional

import strawberry

from src.graphql.schema import (
    PaginationWindow,
    SubmissionSchema,
)
from src.graphql.service import SubmissionService
from src.middlewares.auth import auth


@strawberry.type
class QuerySubmissionsResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    async def get_submissions(
        self,
        info: strawberry.Info,
        limit: int = 100,
        offset: int = 0,
        order_by: str = 'created',
        application_status: Optional[str] = None,
        form_name: Optional[str] = None,
        form_type: Optional[str] = None,
        parent_form_id: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> PaginationWindow[SubmissionSchema]:
        """
        GraphQL resolver for querying submissions.

        Args:
            info (strawberry.Info): GraphQL context information
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            order_by (str): Filter to sort submissions by (default: 'created')
            application_status (Optional[str]): Filter on submission status
            form_name (Optional[str]): Filter on form name
            form_type (Optional[str]): Filter on form type
            parent_form_id (Optional[str]): Filter on form parent id
            from_date (Optional[str]): Filter from submission date
            to_date (Optional[str]): Filter to submission date
        Returns:
            Paginated list of Submission objects containing combined PostgreSQL and MongoDB data
        """
        # Create filters dict. Filters that share names with PostgreSQL or MongoDB column names
        # will be applied automatically. Other filters will require additional handling.
        filters = {}
        filters["order_by"] = order_by
        if application_status:
            filters["application_status"] = application_status
        if form_name:
            filters["form_name"] = form_name
        if form_type:
            filters["form_type"] = form_type
        if parent_form_id:
            filters["parent_form_id"] = parent_form_id
        if from_date:
            filters["from_date"] = from_date
        if to_date:
            filters["to_date"] = to_date

        forms = await SubmissionService.get_submissions(
            user_context=info.context.get("user"),
            limit=limit,
            offset=offset,
            filters=filters
        )
        return forms


    @strawberry.field(extensions=[auth.auth_required()])
    async def get_submission(
        self,
        info: strawberry.Info,
        submission_id: str,
    ) -> Optional[SubmissionSchema]:
        """
        GraphQL resolver for querying submission.

        Args:
            info (strawberry.Info): GraphQL context information
            submission_id (str): ID of the submission
        Returns:
            Submission object containing combined PostgreSQL and MongoDB data
        """
        submission = await SubmissionService.get_submission(
            user_context=info.context.get("user"),
            submission_id=submission_id,
        )
        return submission

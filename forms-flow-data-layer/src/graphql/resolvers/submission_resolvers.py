from typing import List, Optional

import strawberry
from strawberry.scalars import JSON

from src.graphql.schema import PaginationWindow, SubmissionSchema
from src.graphql.schema import PaginatedSubmissionResponse
from src.graphql.service import SubmissionService
from src.middlewares.auth import auth


@strawberry.type
class QuerySubmissionsResolver:
    # @strawberry.field(extensions=[auth.auth_required()])
    @strawberry.field
    async def get_submissions(
        self,
        order_by: str = 'id',
        limit: int = 100,
        offset: int = 0,
        form_name: Optional[str] = None,
    ) -> PaginationWindow[SubmissionSchema]:
        """
        GraphQL resolver for querying submissions.

        Args:
            order_by (str): Field to sort by (default: 'id')
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            form_name (Optional[str]): Name of the form to get submissions from
        Returns:
            Paginated list of Submission objects containing combined PostgreSQL and MongoDB data
        """
        filters = {}

        if form_name:
            filters["form_name"] = form_name

        forms = await SubmissionService.get_submissions(
            order_by=order_by,
            limit=limit,
            offset=offset,
            filters=filters
        )
        return forms

    # @strawberry.field(extensions=[auth.auth_required()])
    @strawberry.field
    async def get_submission(
        self,
        info: strawberry.Info,
        form_name: Optional[str] = None,
        sort_by: str = "created",
        sort_order: str = "desc",
        parent_form_id: Optional[str] = None,
        filters: Optional[JSON] = None,
        selected_form_fields: Optional[List[str]] = None,
        created_before: Optional[str] = None,
        created_after: Optional[str] = None,
        page_no: int = 1,
        limit: int = 5,
    ) -> Optional[PaginatedSubmissionResponse]:
        """
        GraphQL resolver for querying submission.

        Args:
            info (strawberry.Info): GraphQL context information
            form_name (Optional[str]): Name of the form
            sort_by (str): Field to sort by (default: "created")
            sort_order (str): Order of sorting (default: "desc")
            parent_form_id (Optional[str]): ID of the parent form
            filters (Optional[JSON]): Filters to apply to the query
            selected_form_fields (Optional[List[str]]): Form fields to include in the response
            created_before (Optional[str]): Filter for submissions created before this date
            created_after (Optional[str]): Filter for submissions created after this date
            page_no (int): Page number for pagination (default: 1)
            limit (int): Number of items per page (default: 5)
        Returns:
            Submission object containing combined SQL and MongoDB data
        """
        submission = await SubmissionService.get_submission(
            info=info,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
            parent_form_id=parent_form_id,
            filters=filters,
            selected_form_fields=selected_form_fields,
            created_before=created_before,
            created_after=created_after,
            page_no=page_no,
            limit=limit,
        )
        return submission

from typing import List, Optional

import strawberry
from strawberry.scalars import JSON

from src.graphql.schema import PaginatedSubmissionResponse
from src.graphql.service import SubmissionService
from src.middlewares.auth import auth


@strawberry.type
class QuerySubmissionsResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    async def get_submission(
        self,
        info: strawberry.Info,
        sort_by: str = "created",
        sort_order: str = "desc",
        parent_form_id: Optional[str] = None,
        filters: Optional[JSON] = None,
        selected_form_fields: Optional[List[str]] = None,
        page_no: int = 1,
        limit: int = 5,
    ) -> Optional[PaginatedSubmissionResponse]:
        """
        GraphQL resolver for querying submission.

        Args:
            info (strawberry.Info): GraphQL context information
            sort_by (str): Field to sort by (default: "created")
            sort_order (str): Order of sorting (default: "desc")
            parent_form_id (Optional[str]): ID of the parent form
            filters (Optional[JSON]): Filters to apply to the query
            selected_form_fields (Optional[List[str]]): Fields to include in the response
            page_no (int): Page number for pagination (default: 1)
            limit (int): Number of items per page (default: 5)
        Returns:
            Submission object containing combined SQL and MongoDB data
        """
        submission = await SubmissionService.get_submission(
            info=info,
            sort_by=sort_by,
            sort_order=sort_order,
            parent_form_id=parent_form_id,
            filters=filters,
            selected_form_fields=selected_form_fields,
            page_no=page_no,
            limit=limit,
        )
        return submission

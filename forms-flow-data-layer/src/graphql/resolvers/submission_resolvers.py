from typing import List, Optional

import strawberry
from strawberry.scalars import JSON

from src.graphql.schema import PaginatedSubmissionResponse, SubmissionSchema
from src.graphql.service import SubmissionService
from src.middlewares.auth import auth
from src.utils import cache_graphql


@strawberry.type
class SubmissionResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    @cache_graphql(expire=120, key_prefix="submissions")
    async def submissions(
        self, task_name: str, limit: int = 5
    ) -> List[SubmissionSchema]:
        """
        GraphQL resolver to retrieve applications and their corresponding submission data based on a specified task name.

        Args:
            limit (int): Maximum number of items to return

        Returns:
            List[SubmissionSchema]: List of submissions
        """
        filtered_applications = await SubmissionService.get_submissions(
            limit=limit, task_name=task_name
        )
        return filtered_applications


@strawberry.type
class QuerySubmissionsResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    async def querysubmissions(
        self,
        info: strawberry.Info,
        sort_by: str,
        sort_order: str,
        parent_form_id: Optional[str] = None,
        search: Optional[JSON] = None,
        mongo_project_fields: Optional[List[str]] = None,
        page_no: int = 1,
        limit: int = 5,
    ) -> PaginatedSubmissionResponse:
        """
        GraphQL resolver for querying submissions with advanced filtering.

        Args:
            info: Strawberry context containing request metadata
            sort_by: Field to sort by
            sort_order: 'asc' or 'desc' sort direction
            parent_form_id: Optional filter for submissions by specific ID
            search: Optional Dictionary of field-value pairs to search across both SQL and MongoDB field
            mongo_project_fields: Optional field for specifying fields to retrieve from MongoDB
            page_no: Pagination page number (default: 1)
            limit: Pagination limit (default: 5)

        Returns:
            List of submission objects containing combined SQL and MongoDB data
        """
        submissions = await SubmissionService.query_submissions(
            info,
            sort_by,
            sort_order,
            parent_form_id,
            search,
            mongo_project_fields,
            page_no,
            limit,
        )
        return submissions

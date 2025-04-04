from typing import List, Optional

import strawberry

from src.graphql.schema import QuerySubmissionsSchema, SubmissionSchema
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
    @cache_graphql(expire=120, key_prefix="query-submissions")
    async def querysubmissions(
        self,
        info: strawberry.Info,
        sort_by: str,
        sort_order: str,
        parent_form_id: Optional[str] = None,
        location: Optional[str] = None,
        submitted_by: Optional[str] = None,
        limit: int = 5,
    ) -> List[QuerySubmissionsSchema]:
        """
        GraphQL resolver for querying submissions with advanced filtering.

        Args:
            info: Strawberry context containing request metadata
            sort_by: Field to sort by
            sort_order: 'asc' or 'desc' sort direction
            parent_form_id: Optional filter for submissions by specific ID
            location: Filter submissions by location
            submitted_by: Optional filter for submissions by specific user
            limit: Pagination limit (default: 5)

        Returns:
            List of submission objects containing combined SQL and MongoDB data
        """
        submissions = await SubmissionService.query_submissions(
            info, sort_by, sort_order, limit, parent_form_id, location, submitted_by
        )
        return submissions

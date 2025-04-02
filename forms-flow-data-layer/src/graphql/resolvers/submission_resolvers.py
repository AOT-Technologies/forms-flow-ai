from typing import List

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
    @cache_graphql(expire=120, key_prefix="query-subissions")
    async def querysubmissions(
        self, submitted_by: str, info: strawberry.Info
    ) -> List[QuerySubmissionsSchema]:
        submissions = await SubmissionService.query_submissions(submitted_by, info)
        return submissions

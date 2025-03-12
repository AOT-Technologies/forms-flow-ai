import strawberry
from typing import List
from src.utils import cache_graphql
from src.graphql.schema import SubmissionSchema
from src.graphql.service import SubmissionService


@strawberry.type
class SubmissionResolver:
    @strawberry.field
    @cache_graphql(expire=120, key_prefix="submissions")
    async def submissions(self, task_name: str, limit: int = 5) -> List[SubmissionSchema]:
        """
        GraphQL resolver to retrieve applications and their corresponding submission data based on a specified task name.

        Args:
            limit (int): Maximum number of items to return

        Returns:
            List[SubmissionSchema]: List of submissions
        """
        filtered_applications = await SubmissionService.get_submissions(limit=limit, task_name=task_name)
        return filtered_applications

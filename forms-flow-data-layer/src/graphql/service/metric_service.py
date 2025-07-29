from typing import List

from src.graphql.schema import MetricSchema
from src.models.webapi import Application
from src.utils import UserContext, get_logger

logger = get_logger(__name__)


class MetricService():
    """Service class for handling metric related operations."""

    @classmethod
    async def get_submission_status_metrics(
        cls,
        user_context: UserContext,
        filters: dict[str, str] = {},
    ) -> List[MetricSchema]:
        """
        Fetches aggregated submission status metrics.

        Args:
            user_context (UserContext): User context information
            filters (dict): Search filters to apply to the query
        Returns:
            List of Metric objects
        """
        result = {}

        # Query webapi database
        submissions = await Application.find_all(**filters)

        # Build metrics
        for s in submissions:
            status = s.application_status
            result[status] = result.get(status, 0) + 1

        # Convert to GraphQL Schema
        metrics = []
        for key, value in result:
            metrics.append(MetricSchema(metric=key, count=value))
        return metrics

from typing import List

from src.graphql.schema import MetricSchema
from src.models.webapi import Application
from src.utils import UserContext, get_logger

logger = get_logger(__name__)


class MetricService():
    """Service class for handling metric related operations."""

    @classmethod
    async def get_submission_metrics(
        cls,
        user_context: UserContext,
        metric: str,
        filters: dict[str, str] = {},
    ) -> List[MetricSchema]:
        """
        Fetches aggregated submission metrics.

        Args:
            user_context (UserContext): User context information
            metric (str): The metric to search on. This should be an existing db column.
            filters (dict): Search filters to apply to the query
        Returns:
            List of Metric objects
        """
        # Query webapi database
        webapi_query = await Application.find_aggregated_application_metrics(metric, **filters)
        webapi_result = (await Application.execute(webapi_query)).all()

        # Convert to GraphQL Schema
        metrics = []
        for wr in webapi_result:
            metrics.append(MetricSchema(metric=wr.metric, count=wr.count))
        return metrics

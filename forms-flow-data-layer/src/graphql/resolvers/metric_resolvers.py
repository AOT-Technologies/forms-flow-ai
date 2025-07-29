from typing import Optional, List

import strawberry

from src.graphql.schema import MetricSchema
from src.graphql.service import MetricService
from src.middlewares.auth import auth


@strawberry.type
class QueryMetricResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    async def get_submission_status_metrics(
        self,
        info: strawberry.Info,
        form_id: str,
        order_by: str = 'created',
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[MetricSchema]:
        """
        GraphQL resolver for querying submission status metrics.

        Args:
            info (strawberry.Info): GraphQL context information
            form_id (str): ID of the form
            order_by (str): Filter to sort submissions by (default: 'created')
            from_date (Optional[str]): Filter from submission date
            to_date (Optional[str]): Filter to submission date
        Returns:
            List of Metric objects
        """
        # Create filters dict. Filters that share names with PostgreSQL or MongoDB column names
        # will be applied automatically. Other filters will require additional handling.
        filters = {}
        filters["order_by"] = order_by
        if form_id:
            filters["latest_form_id"] = form_id
        if from_date:
            filters["from_date"] = from_date
        if to_date:
            filters["to_date"] = to_date

        metrics = await MetricService.get_submission_status_metrics(
            user_context=info.context.get("user"),
            filters=filters
        )
        return metrics

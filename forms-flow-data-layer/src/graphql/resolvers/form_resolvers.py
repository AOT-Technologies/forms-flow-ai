from typing import Optional

import strawberry

from src.graphql.schema import FormSchema, PaginationWindow
from src.graphql.service import FormService
from src.middlewares.auth import auth


@strawberry.type
class QueryFormsResolver:
    @strawberry.field(extensions=[auth.auth_required()])
    async def get_forms(
        self,
        order_by: str = 'id',
        limit: int = 100,
        offset: int = 0,
        type: Optional[str] = None
    ) -> PaginationWindow[FormSchema]:
        """
        GraphQL resolver for querying forms.

        Args:
            order_by (str): Field to sort by (default: 'id')
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            type (Optional[str]): Type of form to return
        Returns:
            Paginated list of Form objects containing combined PostgreSQL and MongoDB data
        """
        filters = {}

        if type:
            filters["type"] = type

        forms = await FormService.get_forms(
            order_by=order_by,
            limit=limit,
            offset=offset,
            filters=filters
        )
        return forms

    @strawberry.field(extensions=[auth.auth_required()])
    async def get_form(
        self,
        form_id: str,
    ) -> Optional[FormSchema]:
        """
        GraphQL resolver for querying form.

        Args:
            form_id (str): ID of the form
        Returns:
            Form object containing combined PostgreSQL and MongoDB data
        """
        form = await FormService.get_form(
            form_id=form_id,
        )
        return form

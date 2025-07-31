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
        info: strawberry.Info,
        limit: int = 100,
        page_no: int = 1,
        order_by: str = 'created',
        type: Optional[str] = None,
        created_by: Optional[str] = None,
        form_name: Optional[str] = None,
        status: Optional[str] = None,
        parent_form_id: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> PaginationWindow[FormSchema]:
        """
        GraphQL resolver for querying forms.

        Args:
            info (strawberry.Info): GraphQL context information
            limit (int): Number of items to return (default: 100)
            page_no (int): Pagination number (default: 1)
            order_by (str): Filter to sort forms by (default: 'created')
            type (Optional[str]): Filter on form type
            created_by (Optional[str]): Filter on user who created the form
            form_name (Optional[str]): Filter on form name
            status (Optional[str]): Filter on form status
            parent_form_id (Optional[str]): Filter on form parent id
            from_date (Optional[str]): Filter from form date
            to_date (Optional[str]): Filter to form date
        Returns:
            Paginated list of Form objects containing combined PostgreSQL and MongoDB data
        """
        # Create filters dict. Filters that share names with PostgreSQL or MongoDB column names
        # will be applied automatically. Other filters will require additional handling.
        filters = {}
        filters["order_by"] = order_by
        if type:
            filters["type"] = type
        if created_by:
            filters["created_by"] = created_by
        if form_name:
            filters["form_name"] = form_name
        if status:
            filters["status"] = status
        if parent_form_id:
            filters["parent_form_id"] = parent_form_id
        if from_date:
            filters["from_date"] = from_date
        if to_date:
            filters["to_date"] = to_date
        
        # Convert page_no to offset
        offset = (page_no - 1) * limit

        forms = await FormService.get_forms(
            user_context=info.context.get("user"),
            limit=limit,
            offset=offset,
            filters=filters
        )
        return forms


    @strawberry.field(extensions=[auth.auth_required()])
    async def get_form(
        self,
        info: strawberry.Info,
        form_id: str,
    ) -> Optional[FormSchema]:
        """
        GraphQL resolver for querying form.

        Args:
            info (strawberry.Info): GraphQL context information
            form_id (str): ID of the form
        Returns:
            Form object containing combined PostgreSQL and MongoDB data
        """
        form = await FormService.get_form(
            user_context=info.context.get("user"),
            form_id=form_id,
        )
        return form

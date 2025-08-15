from datetime import datetime

from sqlalchemy import and_, or_, select
from sqlalchemy.schema import Table
from sqlalchemy.sql.expression import Select
from sqlalchemy.sql import func


from src.utils import UserContext

from .authorization import Authorization, AuthType
from .base import BaseModel
from .constants import WebApiTables


class FormProcessMapper(BaseModel):
    """
    FormProcessMapper class to handle mapper-related information.
    """

    _table_name = WebApiTables.FORM_PROCESS_MAPPER.value
    _table = None  # cache for the mapper table

    @classmethod
    async def first(
        cls,
        user_context: UserContext = None,
        **filters
    ):
        table = await cls.get_table()
        query = await super().first(**filters)
        if user_context:
            query = await cls.apply_tenant_auth(query, table, user_context)
        return query
    
    @classmethod
    async def find_all(        
        cls,
        user_context: UserContext = None,
        **filters
    ):
        table = await cls.get_table()
        query = await super().find_all(**filters)
        if user_context:
            query = await cls.apply_tenant_auth(query, table, user_context)

        # Apply date filters, if any
        if (order_by := filters.get("order_by")) and hasattr(table.c, order_by):
            query = query.order_by(order_by)
            if from_date := filters.get("from_date"):
                query = query.where(getattr(table.c, order_by) >= datetime.fromisoformat(from_date))
            if to_date := filters.get("to_date"):
                query = query.where(getattr(table.c, order_by) <= datetime.fromisoformat(to_date))

        # Get total count
        count = (await cls.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
        return query, count

    @classmethod
    async def apply_tenant_auth(
        cls,
        query: Select,
        table: Table,
        user_context: UserContext
    ):
        """Takes a SQLAlchemy Select query and applies additional tenant auth checks."""
        # Parse user context info
        tenant_key = user_context.tenant_key
        user_groups = user_context.token_info.get("groups", [])

        # Build role conditions array
        auth_table = await Authorization.get_table()
        role_conditions = await Authorization.get_role_conditions(auth_table, user_groups)

        # Apply tenant auth checks
        query = query.join(
            auth_table,
            and_(
                table.c.parent_form_id == auth_table.c.resource_id,
                auth_table.c.tenant == tenant_key,
                or_(*role_conditions),  # ⬅️ Role conditions
                auth_table.c.auth_type == AuthType.APPLICATION.value,
            ),
        )
        return query
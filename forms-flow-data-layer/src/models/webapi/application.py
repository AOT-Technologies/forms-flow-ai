from sqlalchemy import and_, desc, or_, select
from sqlalchemy.sql import func

from src.db.webapi_db import webapi_db

from .authorization import Authorization, AuthType
from .base import BaseModel
from .constants import WebApiTables
from .formprocess_mapper import FormProcessMapper


class Application(BaseModel):
    """
    Application model for the webapi database.
    This class provides methods to interact with the application table.
    """

    _application = None

    @classmethod
    async def get_table(cls):
        if cls._application is None:
            cls._application = await webapi_db.get_table(WebApiTables.APPLICATION.value)
        return cls._application

    @classmethod
    def paginationed_query(cls, query, page_no: int = 1, limit: int = 5):
        """
        Paginate the SQLAlchemy query.
        """
        if page_no < 1:
            page_no = 1
        if limit < 1:
            limit = 5
        return query.limit(limit).offset((page_no - 1) * limit)

    @classmethod
    async def get_authorized_applications(
        cls,
        tenant_key: str,
        roles: list[str],
        parent_form_id: str,
        filter: dict = None,
        sort_by: str = None,
        sort_order: str = None,
        is_paginate: bool = False,
        page_no: int = 1,
        limit: int = 5,
    ):
        """
        Fetches authorized applications based on the provided parameters.
        """
        application_table = await cls.get_table()
        mapper_table = await FormProcessMapper.get_table()
        authorization_table = await Authorization.get_table()
        # ["created_by", "application_status", "id", "created", "form_name"]
        sortable_fields = {
            "application_status": application_table.c.application_status,
            "id": application_table.c.id,
            "created_by": application_table.c.created_by,
            "created": application_table.c.created,
            "form_name": mapper_table.c.form_name,
        }

        query = select(
            application_table, mapper_table.c.parent_form_id, mapper_table.c.form_name
        )

        # Role conditions
        role_conditions = await Authorization.get_role_conditions(
            authorization_table=authorization_table, roles=roles
        )

        # Optional condition
        parent_form_id_condition = (
            mapper_table.c.parent_form_id == parent_form_id if parent_form_id else True
        )

        # Join tables
        query = query.join(
            mapper_table,
            and_(
                application_table.c.form_process_mapper_id == mapper_table.c.id,
                parent_form_id_condition,  # Ensure parent form ID matches if provided
                mapper_table.c.tenant
                == tenant_key,  # Ensure tenant key matches in both tables
            ),
        )

        query = query.join(
            authorization_table,
            and_(
                mapper_table.c.parent_form_id == authorization_table.c.resource_id,
                authorization_table.c.tenant == tenant_key,
                or_(*role_conditions),  # ⬅️ Role conditions
                authorization_table.c.auth_type == AuthType.APPLICATION.value,
            ),
        )

        # Combine conditions
        query = query.where(application_table.c.is_draft.is_(False))

        if (
            filter
        ):  # filter will contain {field: value} pairs eg: { "application_status": "John"}
            for field, value in filter.items():
                if hasattr(application_table.c, field):
                    col = getattr(application_table.c, field)
                    query = query.where(col.ilike(f"%{value}%"))

        if sort_by and sort_order:
            col = sortable_fields[sort_by]
            if sort_order.lower() == "desc":
                query = query.order_by(desc(col))
            else:
                query = query.order_by(col)

        total_count = None
        if is_paginate:
            # If pagination is enabled, we need to count the total number of records
            # without the pagination limit and offset taking the count
            total_count = (
                await cls.execute(select(func.count()).select_from(query.subquery()))
            ).scalar_one()
            query = cls.paginationed_query(query, page_no, limit)

        result = await cls.execute(query)
        applications = result.mappings().all()
        total_count = len(applications) if not is_paginate else total_count

        return applications, total_count

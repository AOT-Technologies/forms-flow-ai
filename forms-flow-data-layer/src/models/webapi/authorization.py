from enum import Enum

from sqlalchemy import and_, or_, select

from src.db.webapi_db import webapi_db

from .base import BaseModel
from .constants import WebApiTables

class AuthType(Enum):
    APPLICATION = "APPLICATION"
    FORM = "FORM"
    DESIGN = "DESIGN"


class Authorization(BaseModel):
    """
    Authorization class to handle authorization-related information.
    """

    _table_name = WebApiTables.AUTHORIZATION.value
    _table = None  # Class-level cache

    @classmethod
    async def get_role_conditions(cls, authorization_table, roles: list[str]):
        """
        Builds SQLAlchemy conditions for roles.
        """
        if authorization_table is None:
            authorization_table = await cls.get_table()
        return [authorization_table.c.roles.contains([role]) for role in roles]

    @classmethod
    async def get_authorization(
        cls,
        resource_id: str,
        tenant_key: str,
        username: str,
        roles: list[str],
        auth_type: str,
    ):
        """
        Builds SQLAlchemy authorization conditions for form resources.
        """
        authorization_table = await cls.get_table()

        role_conditions = await cls.get_role_conditions(
            authorization_table=authorization_table, roles=roles
        )
        query = select(authorization_table)
        # Add tenant_key condition if provided
        if tenant_key:
            query = query.where(authorization_table.c.tenant == tenant_key)

        # If resource_id (e.g., parent form ID) is provided, filter early to reduce row traversal
        if resource_id:
            query = query.where(authorization_table.c.resource_id == resource_id)

        if auth_type == "APPLICATION":
            query = query.where(
                and_(
                    authorization_table.c.auth_type == auth_type, or_(*role_conditions)
                )
            )
        else:
            query = query.where(
                and_(
                    authorization_table.c.auth_type == auth_type,
                    or_(
                        authorization_table.c.user_name == username,
                        *role_conditions,
                        and_(
                            authorization_table.c.user_name.is_(None),
                            or_(
                                authorization_table.c.roles == {},
                                authorization_table.c.roles.is_(None),
                            ),
                        ),
                    ),
                )
            )

        return await cls.execute(query)

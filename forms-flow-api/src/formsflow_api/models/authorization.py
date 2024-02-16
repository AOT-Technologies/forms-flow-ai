"""This manages Authorization Data."""

from __future__ import annotations

from enum import Enum, unique
from typing import List, Optional

from sqlalchemy import JSON, and_, or_
from sqlalchemy.dialects.postgresql import ARRAY, ENUM

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


@unique
class AuthType(Enum):
    """Admin type enum."""

    DASHBOARD = "DASHBOARD"
    FORM = "FORM"
    FILTER = "FILTER"
    DESIGNER = "DESIGNER"
    APPLICATION = "APPLICATION"

    def __str__(self):
        """To string value."""
        return self.value


class Authorization(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages authorization."""

    id = db.Column(db.Integer, primary_key=True, comment="Authorization ID")
    tenant = db.Column(db.String, nullable=True, comment="Tenant key")
    auth_type = db.Column(
        ENUM(AuthType, name="AuthType"), nullable=False, index=True, comment="Auth Type"
    )
    resource_id = db.Column(
        db.String, nullable=False, index=True, comment="Resource identifier"
    )
    resource_details = db.Column(JSON, nullable=True, comment="Resource details")
    roles = db.Column(ARRAY(db.String), nullable=True, comment="Applicable roles")
    user_name = db.Column(db.String, nullable=True, comment="Applicable user")

    @classmethod
    def find_user_authorizations(
        cls,
        auth_type: AuthType,
        roles: List[str] = None,
        user_name: str = None,
        tenant: str = None,
    ) -> List[Authorization]:
        """Find authorizations."""
        query = cls._auth_query(auth_type, roles, tenant, user_name)
        return query.all()

    @classmethod
    def find_all_authorizations(
        cls, auth_type: AuthType, tenant: str = None
    ) -> List[Authorization]:
        """Find authorizations."""
        query = cls.query.filter(Authorization.auth_type == auth_type)

        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query.all()

    @classmethod
    def _auth_query(
        cls, auth_type, roles, tenant, user_name, include_created_by=False
    ):  # pylint: disable=too-many-arguments
        role_condition = [Authorization.roles.contains([role]) for role in roles]
        query = cls.query.filter(Authorization.auth_type == auth_type).filter(
            or_(
                *role_condition,
                include_created_by and Authorization.created_by == user_name,
                Authorization.user_name == user_name,
                and_(
                    Authorization.user_name.is_(None),
                    or_(Authorization.roles == {}, Authorization.roles.is_(None)),
                ),
            )
        )

        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query

    @classmethod
    def find_resource_authorization(  # pylint: disable=too-many-arguments
        cls,
        auth_type: AuthType,
        resource_id: str,
        roles: List[str] = None,
        user_name: str = None,
        tenant: str = None,
    ) -> List[Authorization]:
        """Find resource authorization."""
        query = cls._auth_query(auth_type, roles, tenant, user_name)
        query = query.filter(Authorization.resource_id == str(resource_id))
        return query.all()

    @classmethod
    # pylint: disable=too-many-arguments
    def find_resource_by_id(
        cls,
        auth_type: AuthType,
        resource_id: str,
        is_designer: bool = False,
        roles: List[str] = None,
        user_name: str = None,
        tenant: str = None,
        include_created_by: bool = False,
    ) -> Optional[Authorization]:
        """Find resource authorization by id."""
        if (
            is_designer and auth_type != AuthType.DESIGNER
        ) or auth_type == AuthType.DASHBOARD:
            query = cls.query.filter(Authorization.auth_type == auth_type)
        else:
            query = cls._auth_query(
                auth_type, roles, tenant, user_name, include_created_by
            )
        query = query.filter(Authorization.resource_id == str(resource_id))
        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query.one_or_none()

    @classmethod
    def find_all_resources_authorized(
        cls, auth_type, roles, tenant, user_name, include_created_by=False
    ):  # pylint: disable=too-many-arguments
        """Find all resources authorized to specific user/role or Accessible by all users/roles."""
        query = cls._auth_query(auth_type, roles, tenant, user_name, include_created_by)
        return query.all()

    @classmethod
    def find_auth_list_by_id(  # pylint: disable=too-many-arguments
        cls,
        resource_id: str,
        tenant: str,
    ) -> List[Authorization]:
        """Find authorizations by id."""
        query = cls.query.filter(Authorization.resource_id == str(resource_id))
        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query.all()

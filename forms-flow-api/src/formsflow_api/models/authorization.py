"""This manages Authorization Data."""

from __future__ import annotations

from enum import Enum, unique
from typing import List, Optional

from sqlalchemy import JSON, or_
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
    def _auth_query(cls, auth_type, roles, tenant, user_name):
        role_condition = [Authorization.roles.contains([role]) for role in roles]
        query = (
            cls.query.filter(Authorization.auth_type == auth_type)
            .filter(or_(*role_condition))
            .filter(
                or_(
                    Authorization.user_name.is_(None),
                    Authorization.user_name == user_name,
                )
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
    def find_resource_by_id(
        cls,
        auth_type: AuthType,
        resource_id: str,
        user_name: str = None,
        tenant: str = None,
    ) -> Optional[Authorization]:
        """Find resource authorization by id."""
        query = (
            cls.query.filter(Authorization.resource_id == str(resource_id))
            .filter(Authorization.auth_type == auth_type)
            .filter(
                or_(
                    Authorization.user_name.is_(None),
                    Authorization.user_name == user_name,
                )
            )
        )
        if tenant:
            query = query.filter(Authorization.tenant == tenant)
        return query.one_or_none()

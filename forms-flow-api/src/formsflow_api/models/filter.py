"""This manages Filter information."""
from __future__ import annotations

from typing import List

from formsflow_api_utils.utils.enums import FilterStatus
from sqlalchemy import JSON, and_, or_
from sqlalchemy.dialects.postgresql import ARRAY

from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin


class Filter(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages filter information."""

    id = db.Column(db.Integer, primary_key=True)
    tenant = db.Column(db.String, index=True, nullable=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    resource_id = db.Column(db.String, nullable=True)
    criteria = db.Column(JSON, nullable=True)
    variables = db.Column(ARRAY(JSON), nullable=True)
    properties = db.Column(JSON, nullable=True)
    roles = db.Column(ARRAY(db.String), nullable=True, comment="Applicable roles")
    users = db.Column(ARRAY(db.String), nullable=True, comment="Applicable users")
    status = db.Column(db.String(10), nullable=True)

    @classmethod
    def find_all_active_filters(cls, tenant: str = None) -> List[Filter]:
        """Find all active filters."""
        query = cls.query.filter(Filter.status == str(FilterStatus.ACTIVE.value))
        if tenant:
            query = query.filter(Filter.tenant == tenant)
        return query.all()

    @classmethod
    def create_filter_from_dict(cls, filter_data: dict) -> Filter:
        """Create Filter."""
        if filter_data:
            filter_obj = Filter()
            filter_obj.tenant = filter_data.get("tenant")
            filter_obj.name = filter_data.get("name")
            filter_obj.created_by = filter_data.get("created_by")
            filter_obj.description = filter_data.get("description")
            filter_obj.resource_id = filter_data.get("resource_id")
            filter_obj.criteria = filter_data.get("criteria")
            filter_obj.variables = filter_data.get("variables")
            filter_obj.properties = filter_data.get("properties")
            filter_obj.roles = filter_data.get("roles")
            filter_obj.users = filter_data.get("users")
            filter_obj.status = str(FilterStatus.ACTIVE.value)
            filter_obj.save()
            return filter_obj
        return None

    @classmethod
    def find_user_filters(
        cls, roles: List[str] = None, user: str = None, tenant: str = None
    ):
        """Find active filters of the user."""
        query = cls._auth_query(roles, user, tenant)
        query = query.filter(Filter.status == str(FilterStatus.ACTIVE.value))
        return query.all()

    @classmethod
    def _auth_query(cls, roles, user, tenant):
        role_condition = [Filter.roles.contains([role]) for role in roles]
        query = cls.query.filter(or_(*role_condition, Filter.users.contains([user])))
        if tenant:
            query = query.filter(Filter.tanant == tenant)
        return query

    @classmethod
    def find_filter_by_id(cls, filter_id) -> Filter:
        """Find filter by id."""
        return cls.query.filter(Filter.id == filter_id).first()

    @classmethod
    def find_active_filter_by_id(cls, filter_id) -> Filter:
        """Find active filter by id."""
        return cls.query.filter(
            and_(
                Filter.id == filter_id, Filter.status == str(FilterStatus.ACTIVE.value)
            )
        ).first()

    def mark_inactive(self):
        """Mark filter as inactive."""
        self.status = str(FilterStatus.INACTIVE.value)
        self.commit()

    def update(self, filter_info):
        """Update filter."""
        self.update_from_dict(
            [
                "name",
                "description",
                "criteria",
                "variables",
                "properties",
                "roles",
                "users",
                "modified_by",
                "status",
            ],
            filter_info,
        )
        self.commit()

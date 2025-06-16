"""This manages Filter information."""

from __future__ import annotations

from enum import Enum, unique
from typing import List

from formsflow_api_utils.utils.enums import FilterStatus
from sqlalchemy import JSON, and_, or_
from sqlalchemy.dialects.postgresql import ARRAY, ENUM

from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin


@unique
class FilterType(Enum):
    """Filter type enum."""

    TASK = "TASK"
    ATTRIBUTE = "ATTRIBUTE"


class Filter(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages filter information."""

    id = db.Column(db.Integer, primary_key=True)
    tenant = db.Column(db.String, index=True, nullable=True)
    name = db.Column(db.String, nullable=False)
    criteria = db.Column(JSON, nullable=True)
    variables = db.Column(ARRAY(JSON), nullable=True)
    properties = db.Column(JSON, nullable=True)
    roles = db.Column(ARRAY(db.String), nullable=True, comment="Applicable roles")
    users = db.Column(ARRAY(db.String), nullable=True, comment="Applicable users")
    status = db.Column(db.String(10), nullable=True)
    filter_type = db.Column(
        ENUM(FilterType, name="FilterType"),
        nullable=False,
        default=FilterType.TASK,
        index=True,
    )
    parent_filter_id = db.Column(db.Integer, nullable=True, index=True)

    @classmethod
    def find_all_active_filters(cls, tenant: str = None) -> List[Filter]:
        """Find all active filters."""
        query = cls.query.filter(Filter.status == str(FilterStatus.ACTIVE.value))
        if tenant:
            query = query.filter(Filter.tenant == tenant)
        return query.all()

    @classmethod
    def find_all_filters(cls, tenant: str = None) -> List[Filter]:
        """Find all filters."""
        query = cls.query
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
            filter_obj.criteria = filter_data.get("criteria")
            filter_obj.variables = filter_data.get("variables")
            filter_obj.properties = filter_data.get("properties")
            filter_obj.roles = filter_data.get("roles")
            filter_obj.users = filter_data.get("users")
            filter_obj.status = str(FilterStatus.ACTIVE.value)
            filter_obj.filter_type = filter_data.get("filter_type")
            filter_obj.parent_filter_id = filter_data.get("parent_filter_id")
            filter_obj.save()
            return filter_obj
        return None

    @classmethod
    def find_user_filters(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls,
        roles: List[str] = None,
        user: str = None,
        tenant: str = None,
        filter_type: str = None,
        parent_filter_id: int = None,
        exclude_ids: List[str] = None,
    ):
        """Find active filters of the user."""
        query = cls._auth_query(roles, user, tenant, filter_empty_tenant_key=True)
        # exclude filter ids
        if exclude_ids:
            query = query.filter(Filter.id.notin_(exclude_ids))
        query = query.filter(Filter.status == str(FilterStatus.ACTIVE.value))
        if filter_type:
            query = query.filter(Filter.filter_type == filter_type)
        if parent_filter_id:
            query = query.filter(Filter.parent_filter_id == parent_filter_id)
        return query.all()

    @classmethod
    def _auth_query(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls, roles, user, tenant, filter_empty_tenant_key=False
    ):
        query = cls.query
        role_condition = [Filter.roles.contains([role]) for role in roles]
        query = query.filter(
            or_(
                *role_condition,
                Filter.users.contains([user]),
                and_(
                    or_(cls.roles == {}, cls.roles.is_(None)),
                    or_(cls.users == {}, cls.users.is_(None)),
                ),
                cls.created_by == user,
            )
        )
        if tenant:
            if filter_empty_tenant_key:
                query = query.filter(
                    or_(Filter.tenant == tenant, Filter.tenant.is_(None))
                )
            else:
                query = query.filter(Filter.tenant == tenant)
        return query

    @classmethod
    def find_filter_by_id(cls, filter_id) -> Filter:
        """Find filter by id."""
        return cls.query.filter(Filter.id == filter_id).first()

    @classmethod
    def find_active_filter_by_id(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        cls, filter_id, roles, user, tenant
    ) -> Filter:
        """Find active filter by id."""
        query = cls._auth_query(roles, user, tenant)
        return query.filter(
            and_(
                Filter.id == filter_id, Filter.status == str(FilterStatus.ACTIVE.value)
            )
        ).first()

    @classmethod
    def find_active_filter_by_ids(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        cls, filter_ids, roles, user, tenant
    ) -> list[Filter]:
        """Find active filters by IDs, ensuring only active filters are returned."""
        if not filter_ids:
            return []

        query = cls._auth_query(roles, user, tenant)

        query = query.filter(
            and_(
                Filter.id.in_(filter_ids),  # Properly handle multiple IDs
                Filter.status == str(FilterStatus.ACTIVE.value),
                Filter.filter_type == FilterType.TASK.value,
            )
        )

        return query.all()  # Fetch results properly

    @classmethod
    def find_active_auth_filter_by_id(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls, filter_id, user, filter_admin, roles, tenant
    ) -> Filter:
        """Find active filter by id with edit & delete permission.

        User who created the filter can edit/delete filter they created.
        or filter_admin(manage_all_filters) can edit/delete authorized filter.
        """
        if filter_admin:
            query = cls._auth_query(roles, user, tenant)
        else:
            query = cls.query.filter(cls.created_by == user)
        return query.filter(
            Filter.id == filter_id, Filter.status == str(FilterStatus.ACTIVE.value)
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

    @classmethod
    def find_all_active_filters_formid(
        cls, form_id, tenant: str = None
    ) -> List[Filter]:
        """Find all active filters with specific form id."""
        query = cls.query.filter(
            Filter.status == str(FilterStatus.ACTIVE.value),
            Filter.properties.op("->>")("formId") == form_id,
        )
        if tenant:
            query = query.filter(Filter.tenant == tenant)
        return query.all() or []

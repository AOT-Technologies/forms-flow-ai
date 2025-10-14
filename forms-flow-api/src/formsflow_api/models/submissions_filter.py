"""This manages User filter preference Database Model for Analyze submissions."""

from __future__ import annotations

from sqlalchemy import Index, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, JSON

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db
from .form_process_mapper import FormProcessMapper


class SubmissionsFilter(db.Model, BaseModel, AuditDateTimeMixin):
    """This class manages user-specific preferences for filters in analyze submissions."""

    id = db.Column(
        db.Integer,
        primary_key=True,
        comment="Primary key for the filter preference entry.",
    )
    tenant = db.Column(
        db.String,
        nullable=True,
        comment="Tenant identifier (optional, for multi-tenant support).",
    )
    user = db.Column(
        db.String, nullable=False, comment="Unique identifier for the user."
    )
    parent_form_id = db.Column(
        db.String(100), index=True, nullable=False, comment="ID of the parent form."
    )
    variables = db.Column(
        ARRAY(JSON), nullable=True, comment="Variables associated with the filter."
    )
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
        comment="Flag to indicate if the filter is active.",
    )

    __table_args__ = (
        UniqueConstraint("user", "parent_form_id", name="_user_parent_form_id_uc"),
        Index("idx_user_and_tenant_filter", "tenant", "user"),
    )

    @classmethod
    def get_filter_preferences_by_user_and_parent_for_id(
        cls, user: str, parent_form_id: str, tenant: str | None = None
    ):
        """Get filter preferences by user and parent form ID."""
        query = cls.query.filter_by(
            user=user, parent_form_id=parent_form_id, is_active=True
        )
        if tenant is not None:
            query = query.filter_by(tenant=tenant)
        return query.first()

    @classmethod
    def fetch_all_filter_preferences_by_user(cls, user: str, tenant: str | None = None):
        """
        Get all active filter preferences for a user, optionally filtered by tenant.

        This method retrieves all filter preferences for the given user, joining with the
        FormProcessMapper table to get the latest form mapping for each parent_form_id.
        Only active filters are returned.

        Args:
            user (str): Unique identifier for the user.
            tenant (str | None): Tenant identifier (optional).

        Returns:
            List of tuples containing filter preference and related form mapping fields.
        """
        # Subquery to get the latest FormProcessMapper ID for each parent_form_id
        max_id_subquery = (
            db.session.query(
                FormProcessMapper.parent_form_id,
                func.max(FormProcessMapper.id).label("max_id"),
            )
            .group_by(FormProcessMapper.parent_form_id)
            .subquery()
        )
        # Join SubmissionsFilter with FormProcessMapper using the subquery to get latest mapping
        query = (
            cls.query.with_entities(
                cls.id,
                cls.tenant,
                cls.user,
                cls.parent_form_id,
                cls.variables,
                FormProcessMapper.form_id,
            )
            .join(
                max_id_subquery, cls.parent_form_id == max_id_subquery.c.parent_form_id
            )
            .join(
                FormProcessMapper,
                (FormProcessMapper.parent_form_id == max_id_subquery.c.parent_form_id)
                & (FormProcessMapper.id == max_id_subquery.c.max_id),
            )
            .filter(cls.user == user, cls.is_active)
        )
        # Optionally filter by tenant
        if tenant is not None:
            query = query.filter(cls.tenant == tenant)
        return query.all()

    @classmethod
    def get_filter_preferences_by_id(
        cls, filter_id: int, user: str, tenant: str | None = None
    ):
        """Get filter preferences by ID."""
        query = cls.query.filter_by(id=filter_id, user=user, is_active=True)
        if tenant is not None:
            query = query.filter_by(tenant=tenant)
        return query.one_or_none()

"""This manages User filter preference Database Model for Analyze submissions."""

from __future__ import annotations

from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSON

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db


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
        """Get all filter preferences by user for a specific tenant."""
        query = cls.query.filter_by(user=user, is_active=True)
        if tenant is not None:
            query = query.filter_by(tenant=tenant)
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

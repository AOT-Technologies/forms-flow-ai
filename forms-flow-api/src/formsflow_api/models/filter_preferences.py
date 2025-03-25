"""This manages filter preference Database Models."""

from __future__ import annotations

from typing import List

from formsflow_api_utils.utils.enums import FilterStatus
from sqlalchemy import Index, UniqueConstraint, tuple_
from sqlalchemy.orm import relationship

from formsflow_api.models import Filter

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class FilterPreferences(db.Model, BaseModel, AuditDateTimeMixin):
    """Stores user-specific preferences for filters, including sort order and visibility."""

    __tablename__ = "filter_preferences"
    id = db.Column(
        db.Integer,
        primary_key=True,
        comment="Primary key for the User Preference entry.",
    )
    tenant = db.Column(
        db.String,
        nullable=True,
        comment="Tenant identifier (optional, for multi-tenant support).",
    )
    user_id = db.Column(
        db.String, index=True, nullable=False, comment="Unique identifier for the user."
    )
    filter_id = db.Column(
        db.Integer,
        db.ForeignKey("filter.id", ondelete="CASCADE"),
        comment="Reference to the filter ID.",
    )
    sort_order = db.Column(
        db.Integer, comment="Sort order preference for the applied filter."
    )
    hide = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
        comment="Flag to indicate if the filter is hidden.",
    )

    filter = relationship("Filter", lazy="joined", backref="filter_preferences")

    __table_args__ = (
        UniqueConstraint("user_id", "filter_id", name="_filter_order_uc"),
        Index("idx_user_id_and_tenant", "tenant", "user_id"),
    )

    @classmethod
    def bulk_upsert_preferences(cls, preferences_list: List[dict], tenant_key: str):
        """Upsert in filter preferences."""
        if not preferences_list:
            return []

        # exctract userid and filter id for search
        keys = [(p["user_id"], p["filter_id"]) for p in preferences_list]
        # fetch existing data
        query = cls.query.filter(tuple_(cls.user_id, cls.filter_id).in_(keys))
        if tenant_key:
            query.filter(cls.tenant == tenant_key)
        # feth all existing records
        existing_records = query.all()
        # create a existing data lookup dict
        existing_lookup = {
            (r.user_id, r.filter_id, r.tenant): r for r in existing_records
        }
        for pref in preferences_list:
            key = (pref["user_id"], pref["filter_id"], pref.get("tenant"))
            if key in existing_lookup:
                # Update existing
                record = existing_lookup[key]
                record.sort_order = pref.get("sort_order")
                record.hide = pref.get("hide", False)
            else:
                # Create new
                new_record = cls(
                    user_id=pref["user_id"],
                    filter_id=pref["filter_id"],
                    sort_order=pref.get("sort_order"),
                    tenant=pref.get("tenant"),
                    hide=pref.get("hide", False),
                )
                db.session.add(new_record)

        return db.session.commit()

    @classmethod
    def get_filters_by_user_id(
        cls, user_id: str, tenant: str
    ) -> List[FilterPreferences]:
        """Find filter prefernce with specific user id."""
        query = cls.query.filter(
            cls.user_id == user_id,
            cls.filter.has(Filter.status == str(FilterStatus.ACTIVE.value)),
        )
        if tenant:
            query = query.filter(cls.tenant == tenant)
        query = query.order_by(cls.sort_order.asc())
        return query.all() or []

"""This manages User Database Models."""

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


class User(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages user information."""

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50), nullable=False)
    default_filter = db.Column(
        db.Integer, db.ForeignKey("filter.id", ondelete="SET NULL"), nullable=True
    )
    locale = db.Column(db.String(), nullable=True, comment="language code")
    tenant = db.Column(ARRAY(db.String), nullable=True, comment="tenant keys")
    __table_args__ = (UniqueConstraint("user_name", name="uq_user_user_name"),)

    @classmethod
    def create_user(cls, user_data: dict):
        """Create new user."""
        assert user_data is not None
        user = cls()
        user.created_by = user_data.get("created_by")
        user.user_name = user_data.get("user_name")
        user.locale = user_data.get("locale")
        user.tenant = user_data.get("tenant")
        user.default_filter = user_data.get("default_filter")
        user.save()
        return user

    def update(self, user_data: dict):
        """Update user data."""
        self.update_from_dict(
            [
                "locale",
                "tenant",
                "default_filter",
            ],
            user_data,
        )
        self.commit()

    @classmethod
    def get_user_by_user_name(cls, user_name: str = None):
        """Find user data by username."""
        assert user_name is not None
        query = cls.query.filter(cls.user_name == user_name)
        return query.one_or_none()

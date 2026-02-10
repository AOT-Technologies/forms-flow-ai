"""This manages User Database Models."""

from flask_sqlalchemy.query import Query
from formsflow_api_utils.utils.user_context import UserContext, user_context
from sqlalchemy import UniqueConstraint

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


class User(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages user information."""

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(), nullable=True, comment="user selected role")
    default_filter = db.Column(
        db.Integer, db.ForeignKey("filter.id", ondelete="SET NULL"), nullable=True
    )
    default_submissions_filter = db.Column(
        db.Integer,
        db.ForeignKey("submissions_filter.id", ondelete="SET NULL"),
        nullable=True,
    )
    locale = db.Column(db.String(), nullable=True, comment="language code")
    tenant = db.Column(db.String(), nullable=True, comment="tenant key")
    __table_args__ = (
        UniqueConstraint("user_name", "tenant", name="uq_tenant_user_name"),
    )

    @classmethod
    def create_user(cls, user_data: dict):
        """Create new user."""
        assert user_data is not None
        user = cls()
        user.created_by = user_data.get("created_by")
        user.user_name = user_data.get("user_name")
        user.role = user_data.get("role")
        user.locale = user_data.get("locale")
        user.tenant = user_data.get("tenant")
        user.default_filter = user_data.get("default_filter")
        user.default_submissions_filter = user_data.get("default_submissions_filter")
        user.save()
        return user

    def update(self, user_data: dict):
        """Update user data."""
        self.update_from_dict(
            [
                "role",
                "locale",
                "tenant",
                "default_filter",
                "default_submissions_filter",
            ],
            user_data,
        )
        self.commit()

    @classmethod
    @user_context
    def tenant_authorization(cls, query: Query, **kwargs):
        """Modifies the query to include tenant check if needed."""
        tenant_auth_query: Query = query
        user: UserContext = kwargs["user"]
        tenant_key: str = user.tenant_key
        if not isinstance(query, Query):
            raise TypeError("Query object must be of type Query")
        if tenant_key is not None:
            tenant_auth_query = tenant_auth_query.filter(cls.tenant == tenant_key)
        return tenant_auth_query

    @classmethod
    def get_user_by_user_name(cls, user_name: str = None):
        """Find user data by username."""
        assert user_name is not None
        query = cls.query.filter(cls.user_name == user_name)
        query = cls.tenant_authorization(query)
        return query.one_or_none()

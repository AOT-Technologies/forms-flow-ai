"""This manages theme Database Models."""

from sqlalchemy import JSON, UniqueConstraint

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


class Themes(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages theme customization information."""

    id = db.Column(db.Integer, primary_key=True)
    logo_name = db.Column(db.String(50), nullable=False)
    logo_type = db.Column(db.String(50), nullable=False)
    logo_data = db.Column(
        db.String(), nullable=False, comment="logo_data contain a base64 or a URL."
    )
    application_title = db.Column(db.String(50), nullable=False)
    theme = db.Column(JSON, nullable=False, comment="Json data")
    tenant = db.Column(db.String(20), nullable=True, index=True)
    __table_args__ = (UniqueConstraint("tenant", name="uq_tenant"),)

    @classmethod
    def create_theme(cls, theme_info: dict):
        """Create new theme."""
        assert theme_info is not None
        theme = cls()
        theme.created_by = theme_info.get("created_by")
        theme.logo_name = theme_info["logo_name"]
        theme.logo_type = theme_info["logo_type"]
        theme.logo_data = theme_info["logo_data"]
        theme.application_title = theme_info["application_title"]
        theme.tenant = theme_info.get("tenant")
        theme.theme = theme_info["theme"]
        theme.save()
        return theme

    def update(self, theme_info: dict):
        """Update theme."""
        self.update_from_dict(
            [
                "logo_name",
                "logo_type",
                "logo_data",
                "application_title",
                "theme",
            ],
            theme_info,
        )
        self.commit()

    @classmethod
    def get_theme(cls, tenant: str = None):
        """Find theme that matches the provided tenant."""
        # For multi tenant setup there would be multiple records in this table,
        # so match with tenant and return the record.
        # For a non-multi tenant setup there SHOULD be only one record in this table, so return the record
        query = cls.query.filter(cls.tenant == tenant) if tenant else cls.query
        return query.one_or_none()

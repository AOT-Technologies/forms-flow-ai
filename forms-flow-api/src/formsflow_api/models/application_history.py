"""This manages Application audit data."""

from __future__ import annotations

from formsflow_api.models.audit_mixin import ApplicationAuditDateTimeMixin
from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db


class ApplicationHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages application audit against each form."""

    __tablename__ = "application_audit"
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, nullable=False)
    application_status = db.Column(db.String(100), nullable=False)
    form_url = db.Column(db.String(500), nullable=False)
    submitted_by = db.Column(db.String(300), nullable=True)
    form_id = db.Column(db.String(100), nullable=False)
    submission_id = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(50), nullable=True)
    percentage = db.Column(db.Double, nullable=True)

    @classmethod
    def create_from_dict(cls, application_audit_info: dict) -> ApplicationHistory:
        """Create new application."""
        if application_audit_info:
            application_audit = ApplicationHistory()
            application_audit.application_id = application_audit_info["application_id"]
            application_audit.application_status = application_audit_info[
                "application_status"
            ]
            application_audit.form_url = application_audit_info["form_url"]
            application_audit.submitted_by = application_audit_info["submitted_by"]
            application_audit.form_id = application_audit_info["form_id"]
            application_audit.submission_id = application_audit_info["submission_id"]
            application_audit.color = application_audit_info.get("color")
            application_audit.percentage = application_audit_info.get("percentage")
            application_audit.save()
            return application_audit
        return None

    @classmethod
    def get_application_history(cls, application_id: int):
        """Fetch application history."""
        return (
            cls.query.filter(cls.application_id == application_id)
            .order_by(cls.created)
            .group_by(
                cls.id,
                cls.application_status,
                cls.form_id,
                cls.submission_id,
                cls.created,
                cls.submitted_by,
            )
        )

    @classmethod
    def get_application_history_by_id(cls, application_id: int):
        """Find application history by id."""
        return cls.query.filter(cls.application_id == application_id).first()

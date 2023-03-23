"""This manages Application audit data."""
from __future__ import annotations

from typing import List

from sqlalchemy import CheckConstraint

from formsflow_api.models.audit_mixin import ApplicationAuditDateTimeMixin
from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db


class ApplicationHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages application audit against each form."""

    __tablename__ = "application_audit"
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, nullable=False)
    application_status = db.Column(db.String(100))
    form_url = db.Column(db.String(500), nullable=False)
    submitted_by = db.Column(db.String(300), nullable=True)
    form_id = db.Column(db.String(100), nullable=False)
    submission_id = db.Column(db.String(100), nullable=False)
    request_type = db.Column(db.String())
    request_status = db.Column(db.String())
    is_request = db.Column(db.Boolean, nullable=True, default=False)

    __table_args__ = (
        # Either application_status or request_status is required.
        CheckConstraint(
            "(application_status IS NOT NULL AND request_status IS NULL) "
            "OR (application_status IS NULL AND request_status IS NOT NULL)",
            name="one_of_application_status_or_request_status_is_required",
        ),
    )

    @classmethod
    def create_from_dict(cls, application_audit_info: dict) -> ApplicationHistory:
        """Create new application."""
        if application_audit_info:
            application_audit = ApplicationHistory()
            application_audit.application_id = application_audit_info["application_id"]
            application_audit.application_status = application_audit_info.get(
                "application_status"
            )

            application_audit.form_url = application_audit_info["form_url"]
            application_audit.submitted_by = application_audit_info["submitted_by"]
            application_audit.form_id = application_audit_info["form_id"]
            application_audit.submission_id = application_audit_info["submission_id"]
            application_audit.submission_id = application_audit_info["submission_id"]

            application_audit.request_type = application_audit_info.get("request_type")
            application_audit.request_status = application_audit_info.get(
                "request_status"
            )
            application_audit.is_request = application_audit_info.get("is_request")
            application_audit.save()
            return application_audit
        return None

    @classmethod
    def get_application_history(cls, application_id: int) -> List[ApplicationHistory]:
        """Fetch application history."""
        return (
            cls.query.filter(cls.application_id == application_id)
            .order_by(cls.created)
            .all()
        )

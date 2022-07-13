"""This manages Submission Database Models."""


from __future__ import annotations

import uuid

from sqlalchemy.dialects.postgresql import JSON, UUID

from formsflow_api.models import Application

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class Draft(AuditDateTimeMixin, BaseModel, db.Model):
    """This class manages submission information."""

    __tablename__ = "draft"
    id = db.Column(db.Integer, primary_key=True)
    _id = db.Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4, nullable=False)
    data = db.Column(JSON, nullable=False)
    status = db.Column(db.String(10), nullable=True)
    application_id = db.Column(
        db.Integer, db.ForeignKey("application.id"), nullable=False
    )

    @classmethod
    def create_from_dict(cls, application_info: dict) -> Application:
        """Create new application."""
        if application_info:
            application = Application()
            application.created_by = application_info["created_by"]
            application.application_status = application_info["application_status"]
            application.form_process_mapper_id = application_info[
                "form_process_mapper_id"
            ]
            application.save()
            return application
        return None

    @classmethod
    def create_draft_dict(cls, draft_info: dict) -> Draft:
        """Create new application."""
        if draft_info:
            draft = Draft()
            draft.status = 1
            draft.application_id = draft_info["application_id"]
            draft.data = draft_info["data"]
            draft.save()
            return draft
        return None

    def update(self, draft_info: dict):
        """Update draft."""
        self.update_from_dict(
            [
                "data",
            ],
            draft_info,
        )
        self.commit()

    @classmethod
    def find_by_id(cls, draft_id: int) -> Draft:
        """Find draft that matches the provided id."""
        return cls.query.filter_by(id=draft_id).first()

    @classmethod
    def find_all(cls):
        """Fetch all submission."""
        return cls.query.order_by(Draft.id.desc()).all()

"""This manages Submission Database Models."""

from __future__ import annotations

import uuid

from formsflow_api_utils.utils.enums import DraftStatus
from sqlalchemy.dialects.postgresql import JSON, UUID

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
    def create_draft_from_dict(cls, draft_info: dict) -> Draft:
        """Create new application."""
        if draft_info:
            draft = Draft()
            draft.status = DraftStatus.ACTIVE.value
            draft.application_id = draft_info["application_id"]
            draft.data = draft_info["data"]
            draft.save()
            return draft
        return None

    def update(self, draft_info: dict):
        """Update draft."""
        self.update_from_dict(
            ["data", "status"],
            draft_info,
        )
        self.save_and_flush()

    def update_draft_data_and_commit(self, draft_info: dict):
        """Update & commit draft data."""
        self.update_from_dict(
            ["data"],
            draft_info,
        )
        self.commit()

    @classmethod
    def get_draft_by_application_id(cls, application_id: str) -> Draft:
        """Get draft that matches the provided id."""
        return cls.query.filter(cls.application_id == application_id).one_or_none()

"""This manages Submission Database Models."""


from __future__ import annotations

import uuid

from sqlalchemy import update
from sqlalchemy.dialects.postgresql import JSON, UUID

from formsflow_api.utils.enums import DraftStatus

from .application import Application
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
        self.commit()

    @classmethod
    def find_by_id(cls, draft_id: int) -> Draft:
        """Find draft that matches the provided id."""
        return cls.query.get(draft_id)

    @classmethod
    def find_all(cls):
        """Fetch all draft entries."""
        return cls.query.order_by(Draft.id.desc()).all()

    @classmethod
    def find_all_active(cls):
        """Fetch all active drafts."""
        result = (
            cls.query.filter(cls.status == str(DraftStatus.ACTIVE.value))
            .order_by(Draft.id.desc())
            .all()
        )
        return result

    @classmethod
    def make_submission(cls, draft_id, data):
        """Activates the application from the draft entry."""
        draft = cls.query.get(draft_id)
        if not draft:
            return None
        stmt = (
            update(Application)
            .where(Application.id == draft.application_id)
            .values(
                application_status=data["application_status"],
                submission_id=data["submission_id"],
            )
        )
        cls.execute(stmt)
        # The update statement will be commited by the following update
        draft.update({"status": DraftStatus.INACTIVE.value, "data": {}})
        return draft

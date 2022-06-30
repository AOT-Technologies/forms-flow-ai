"""This manages Submission Database Models."""


from __future__ import annotations
from email.policy import default
import json
from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db
from sqlalchemy.dialects.postgresql import JSON, UUID
import uuid

class Submission(BaseModel, db.Model):
    """This class manages submission information."""

    __tablename__ = "submission"
    id = db.Column(db.Integer, primary_key=True)
    _id =db.Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4, nullable=False)
    data = db.Column(JSON, nullable=False)

    @classmethod
    def create_from_dict(cls, submission_info: dict) -> Submission:
        """Create new application."""
        if submission_info:
            submission = Submission()
            submission.data = submission_info["data"]
            submission.save()
            return submission
        return None

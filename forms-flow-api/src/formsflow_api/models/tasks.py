"""This manages Task Data."""

from __future__ import annotations

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import ARRAY

from .audit_mixin import ApplicationAuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class TaskOutcomeConfiguration(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages task outcome configurations."""

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(
        db.String(100), nullable=False, comment="Task ID", unique=True, index=True
    )
    task_outcome = db.Column(ARRAY(JSON), nullable=True, comment="Task outcome")
    created_by = db.Column(db.String(100), nullable=True, comment="Created by")
    tenant = db.Column(db.String(100), nullable=True, comment="Tenant key", index=True)

    @classmethod
    def create_from_dict(
        cls, task_outcome_info: dict
    ) -> TaskOutcomeConfiguration | None:
        """Create new task outcome."""
        if task_outcome_info:
            task = TaskOutcomeConfiguration()
            task.created_by = task_outcome_info.get("created_by")
            task.task_id = task_outcome_info.get("task_id")
            task.task_outcome = task_outcome_info.get("task_outcome")
            task.tenant = task_outcome_info.get("tenant")
            task.save()
            return task
        return None

    @classmethod
    def get_task_outcome_by_task_id(
        cls, task_id: str, tenant: str
    ) -> TaskOutcomeConfiguration | None:
        """Get task outcome configuration by task ID."""
        query = cls.query.filter_by(task_id=task_id)
        if tenant:
            query = query.filter_by(tenant=tenant)
        task_outcome = query.first()
        return task_outcome if task_outcome else None

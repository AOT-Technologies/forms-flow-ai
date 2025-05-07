"""This manages Task Data."""

from __future__ import annotations

from sqlalchemy import JSON

from .audit_mixin import ApplicationAuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class TaskOutcomeConfiguration(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages task outcome configurations."""

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(
        db.String(100), nullable=False, comment="Task ID", unique=True, index=True
    )
    task_name = db.Column(db.String(100), nullable=True, comment="Task name")
    task_transition_map = db.Column(
        JSON, nullable=False, comment="Task transition configuration"
    )
    transition_map_type = db.Column(
        db.String(100),
        nullable=False,
        default="select",
        comment="Task transition configuration type",
    )
    created_by = db.Column(db.String(100), nullable=False, comment="Created by")
    tenant = db.Column(db.String(100), nullable=True, comment="Tenant key", index=True)

    @classmethod
    def get_task_outcome_configuration_by_task_id(
        cls, task_id: str, tenant: str
    ) -> TaskOutcomeConfiguration | None:
        """Get task outcome configuration by task ID."""
        query = cls.query.filter_by(task_id=task_id)
        if tenant is not None:
            query = query.filter_by(tenant=tenant)
        task_outcome = query.first()
        return task_outcome if task_outcome else None

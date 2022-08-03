"""This manages Submission Database Models."""


from __future__ import annotations

import uuid

from sqlalchemy import and_, update
from sqlalchemy.dialects.postgresql import JSON, UUID

from formsflow_api.utils.enums import DraftStatus

from .application import Application
from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db
from .form_process_mapper import FormProcessMapper
from formsflow_api.utils import FILTER_MAPS, validate_sort_order_and_order_by
from sqlalchemy.sql.expression import text


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
    def get_by_id(cls, draft_id: str, user_id: str) -> Draft:
        """doc"""
        result = (
            cls.query.join(Application, Application.id == cls.application_id)
            .join(
                FormProcessMapper,
                FormProcessMapper.id == Application.form_process_mapper_id,
            )
            .filter(
                and_(
                    cls.status == str(DraftStatus.ACTIVE.value),
                    Application.created_by == user_id,
                    cls.id == draft_id,
                )
            )
        )
        return FormProcessMapper.tenant_authorization(result).first()

    @classmethod
    def find_by_id(cls, draft_id: int, user_id: str) -> Draft:
        """Find draft that matches the provided id."""
        result = (
            cls.query.with_entities(
                FormProcessMapper.form_name,
                FormProcessMapper.process_name,
                FormProcessMapper.created_by,
                FormProcessMapper.form_id,
                cls.id,
                cls.application_id,
                cls.created,
                cls.modified,
                cls.data
            )
            .join(Application, Application.id == cls.application_id)
            .join(
                FormProcessMapper,
                FormProcessMapper.id == Application.form_process_mapper_id,
            )
            .filter(
                and_(
                    cls.status == str(DraftStatus.ACTIVE.value),
                    Application.created_by == user_id,
                    cls.id == draft_id,
                )
            )
        )
        return FormProcessMapper.tenant_authorization(result).first()

    @classmethod
    def find_all_active(
        cls,
        user_name: str,
        page_number=None,
        limit=None,
        sort_by=None,
        sort_order=None,
        **filters
        ):
        """Fetch all active drafts."""
        result = (
            cls.filter_conditions(**filters)
            .with_entities(
                FormProcessMapper.form_name,
                FormProcessMapper.process_name,
                FormProcessMapper.created_by,
                FormProcessMapper.form_id,
                cls.id,
                cls.application_id,
                cls.created,
                cls.modified,
                cls.data
            )
            .join(Application, Application.id == cls.application_id)
            .join(
                FormProcessMapper,
                Application.form_process_mapper_id == FormProcessMapper.id,
            )
            .filter(
                and_(
                    cls.status == str(DraftStatus.ACTIVE.value),
                    Application.created_by == user_name,
                )
            )
            .order_by(Draft.id.desc())
        )
        sort_by, sort_order = validate_sort_order_and_order_by(sort_by, sort_order)
        if sort_by and sort_order:
            result = result.order_by(text(f"draft.{sort_by} {sort_order}"))
        result = FormProcessMapper.tenant_authorization(result)
        total_count = result.count()
        limit = total_count if limit is None else limit
        result = result.paginate(page_number, limit)
        return result.items, total_count

    @classmethod
    def make_submission(cls, draft_id, data, user_id):
        """Activates the application from the draft entry."""
        # draft = cls.query.get(draft_id)
        draft = cls.get_by_id(draft_id, user_id)
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

    @classmethod
    def filter_conditions(cls, **filters):
        """This method creates dynamic filter conditions based on the input param."""
        filter_conditions = []
        for key, value in filters.items():
            if value:
                filter_map = FILTER_MAPS[key]
                condition = cls.create_filter_condition(
                    model=FormProcessMapper,
                    column_name=filter_map["field"],
                    operator=filter_map["operator"],
                    value=value,
                )
                filter_conditions.append(condition)
        query = cls.query.filter(*filter_conditions) if filter_conditions else cls.query
        return query
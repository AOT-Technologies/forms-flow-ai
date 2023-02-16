"""This manages Submission Database Models."""


from __future__ import annotations

import uuid

from formsflow_api_utils.utils import (
    DRAFT_APPLICATION_STATUS,
    FILTER_MAPS,
    validate_sort_order_and_order_by,
)
from formsflow_api_utils.utils.enums import DraftStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context
from sqlalchemy import and_, update
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.sql.expression import text

from .application import Application
from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db
from .form_process_mapper import FormProcessMapper


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
        """Retrieves the draft entry by id."""
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
                Application.created_by,
                FormProcessMapper.form_id,
                FormProcessMapper.process_key,
                FormProcessMapper.process_name,
                cls.id,
                cls.application_id,
                cls.created,
                cls.modified,
                cls.data,
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
    def find_all_active(  # pylint: disable=too-many-arguments
        cls,
        user_name: str,
        page_number=None,
        limit=None,
        sort_by="id",
        sort_order="desc",
        **filters,
    ):
        """Fetch all active drafts."""
        result = (
            cls.filter_conditions(**filters)
            .with_entities(
                FormProcessMapper.form_name,
                FormProcessMapper.process_name,
                Application.created_by,
                FormProcessMapper.form_id,
                cls.id,
                cls.application_id,
                cls.created,
                cls.modified,
                cls.data,
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
        )
        sort_by, sort_order = validate_sort_order_and_order_by(sort_by, sort_order)
        model_name = "form_process_mapper" if sort_by == "form_name" else "draft"
        if sort_by and sort_order:
            result = result.order_by(text(f"{model_name}.{sort_by} {sort_order}"))
        result = FormProcessMapper.tenant_authorization(result)
        total_count = result.count()
        limit = total_count if limit is None else limit
        result = result.paginate(page=page_number, per_page=limit, error_out=False)
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
                model_name = (
                    Draft
                    if not filter_map["field"] == "form_name"
                    else FormProcessMapper
                )
                condition = cls.create_filter_condition(
                    model=model_name,
                    column_name=filter_map["field"],
                    operator=filter_map["operator"],
                    value=value,
                )
                filter_conditions.append(condition)
        query = cls.query.filter(*filter_conditions) if filter_conditions else cls.query
        return query

    @classmethod
    @user_context
    def get_draft_count(cls, **kwargs):
        """Get active draft count."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        query = cls.query.join(Application, cls.application_id == Application.id)
        query = query.filter(Application.created_by == user_id)
        query = query.filter(
            and_(
                Application.application_status == DRAFT_APPLICATION_STATUS,
                Draft.status == str(DraftStatus.ACTIVE.value),
            )
        )
        query = FormProcessMapper.tenant_authorization(
            query=query.join(
                FormProcessMapper,
                Application.form_process_mapper_id == FormProcessMapper.id,
            )
        )
        draft_count = query.count()
        return draft_count

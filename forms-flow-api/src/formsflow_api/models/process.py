"""This manages Process Data."""

from __future__ import annotations

from enum import Enum, unique
from typing import List

from flask_sqlalchemy.query import Query
from formsflow_api_utils.utils import (
    FILTER_MAPS,
    validate_sort_order_and_order_by,
)
from formsflow_api_utils.utils.user_context import UserContext, user_context
from sqlalchemy import LargeBinary, desc
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.sql.expression import text

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


@unique
class ProcessType(Enum):
    """Process type enum."""

    BPMN = "BPMN"
    LOWCODE = "LOWCODE"
    DMN = "DMN"


@unique
class ProcessStatus(Enum):
    """Process status enum."""

    DRAFT = "Draft"
    PUBLISHED = "Published"


class Process(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages process data."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    process_type = db.Column(
        ENUM(ProcessType, name="ProcessType"), nullable=False, index=True
    )
    process_data = db.Column(LargeBinary, nullable=False)
    status = db.Column(ENUM(ProcessStatus, name="ProcessStatus"), nullable=False)
    form_process_mapper_id = db.Column(
        db.Integer, db.ForeignKey("form_process_mapper.id"), nullable=True
    )
    tenant = db.Column(db.String(100), nullable=True)
    major_version = db.Column(db.Integer, nullable=False, index=True)
    minor_version = db.Column(db.Integer, nullable=False, index=True)

    @classmethod
    @user_context
    def auth_query(cls, query, **kwargs) -> Process:
        """Query to find authorized process."""
        if not isinstance(query, Query):
            raise TypeError("Query object must be of type Query")
        user: UserContext = kwargs["user"]
        tenant_key: str = user.tenant_key
        if tenant_key is not None:
            query = query.filter(cls.tenant == tenant_key)
        return query

    def update(self, process_info: dict):
        """Update process data."""
        self.update_from_dict(
            [
                "name",
                "status",
                "process_data",
                "modified_by",
                "form_process_mapper_id",
                "modified",
                "major_version",
                "minor_version",
            ],
            process_info,
        )
        self.commit()

    @classmethod
    def find_process_by_id(cls, process_id: int) -> Process:
        """Find process that matches the provided id."""
        query = cls.query.filter(cls.id == process_id)
        query = cls.auth_query(query=query)
        return query.one_or_none()

    @classmethod
    def filter_conditions(cls, **filters):
        """This method creates dynamic filter conditions based on the input param."""
        filter_conditions = []
        for key, value in filters.items():
            if value:
                filter_map = FILTER_MAPS[key]
                condition = Process.create_filter_condition(
                    model=Process,
                    column_name=filter_map["field"],
                    operator=filter_map["operator"],
                    value=value,
                )
                filter_conditions.append(condition)
        query = cls.query.filter(*filter_conditions) if filter_conditions else cls.query
        return query

    @classmethod
    def find_all_process(
        cls,
        page_no=None,
        limit=None,
        sort_by=None,
        sort_order=None,
        **filters,
    ):
        """Find all processes."""
        query = cls.filter_conditions(**filters)
        query = cls.auth_query(query=query)
        sort_by, sort_order = validate_sort_order_and_order_by(sort_by, sort_order)
        if sort_by and sort_order:
            query = query.order_by(text(f"process.{sort_by} {sort_order}"))
        total_count = query.count()
        limit = total_count if limit is None else limit
        query = query.paginate(page=page_no, per_page=limit, error_out=False)
        return query.items, total_count

    @classmethod
    def get_latest_version(cls, process_name):
        """Get latest version of process."""
        query = (
            cls.query.filter(cls.name == process_name)
            .order_by(cls.major_version.desc(), cls.minor_version.desc())
            .first()
        )

        return query

    @classmethod
    def fetch_histories_by_process_name(cls, process_name: str) -> List[Process]:
        """Fetch all versions (histories) of a process by process_name."""
        assert process_name is not None

        query = (
            cls.auth_query(
                cls.query.filter(cls.name == process_name)
            )
            .order_by(desc(cls.major_version), desc(cls.minor_version))
        )

        return query.all()

"""This manages Process Data."""

from __future__ import annotations

from enum import Enum, unique
from typing import List

from flask_sqlalchemy.query import Query
from formsflow_api_utils.utils import FILTER_MAPS, add_sort_filter
from formsflow_api_utils.utils.user_context import UserContext, user_context
from sqlalchemy import LargeBinary, and_, desc, func, or_
from sqlalchemy.dialects.postgresql import ENUM

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
    process_type = db.Column(ENUM(ProcessType, name="ProcessType"), nullable=False)
    process_data = db.Column(LargeBinary, nullable=False)
    status = db.Column(
        ENUM(ProcessStatus, name="ProcessStatus"),
        nullable=False,
        default=ProcessStatus.DRAFT,
    )
    tenant = db.Column(db.String(100), nullable=True)
    major_version = db.Column(db.Integer, nullable=False, index=True)
    minor_version = db.Column(db.Integer, nullable=False, index=True)
    process_key = db.Column(db.String)
    parent_process_key = db.Column(db.String)
    is_subflow = db.Column(db.Boolean, default=False)
    status_changed = db.Column(db.Boolean, default=False)

    @classmethod
    def create_from_dict(cls, process_data: dict) -> Process:
        """Create a new process from a dictionary."""
        if process_data:
            process = Process(
                name=process_data.get("name"),
                process_type=process_data.get("process_type"),
                tenant=process_data.get("tenant"),
                process_data=process_data.get("process_data"),
                created_by=process_data.get("created_by"),
                major_version=process_data.get("major_version"),
                minor_version=process_data.get("minor_version"),
                is_subflow=process_data.get("is_subflow", False),
                status=process_data.get("status", ProcessStatus.DRAFT),
                status_changed=process_data.get("status_changed", False),
                process_key=process_data.get("process_key"),
                parent_process_key=process_data.get("parent_process_key"),
            )

            # Save the new process to the database
            process.save()
            return process
        return None

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
                "modified",
                "major_version",
                "minor_version",
                "process_key",
                "parent_process_key",
                "is_subflow",
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
    def subquery_for_getting_latest_process(cls):
        """Subquery to get the latest process by parent_process_key."""
        subquery = (
            db.session.query(
                cls.parent_process_key,
                func.max(cls.major_version).label("latest_major_version"),
                func.max(cls.minor_version).label("latest_minor_version"),
                func.max(cls.id).label("latest_id"),
            )
            .group_by(cls.parent_process_key)
            .subquery()
        )
        return subquery

    @classmethod
    def find_all_process(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls,
        page_no=None,
        limit=None,
        sort_by=None,
        sort_order=None,
        is_subflow=False,
        **filters,
    ):
        """Find all processes."""
        query = cls.filter_conditions(**filters)
        # take the latest row by grouping parent_process_key
        subquery = cls.subquery_for_getting_latest_process()
        query = query.join(
            subquery,
            (cls.parent_process_key == subquery.c.parent_process_key)
            & (cls.major_version == subquery.c.latest_major_version)
            & (cls.minor_version == subquery.c.latest_minor_version)
            & (cls.id == subquery.c.latest_id),
        )

        if is_subflow:
            query = query.filter(cls.is_subflow.is_(True))
        query = cls.auth_query(query=query)
        query = add_sort_filter(
            query=query, sort_by=sort_by, sort_order=sort_order, model_name="process"
        )
        total_count = query.count()
        limit = total_count if limit is None else limit
        query = query.paginate(page=page_no, per_page=limit, error_out=False)
        return query.items, total_count

    @classmethod
    def get_latest_version_by_key(cls, process_key):
        """Get latest version of process."""
        query = (
            cls.auth_query(cls.query.filter(cls.process_key == process_key))
            .order_by(cls.major_version.desc(), cls.minor_version.desc(), cls.id.desc())
            .first()
        )

        return query

    @classmethod
    def fetch_published_history_by_parent_process_key(
        cls, parent_process_key: str
    ) -> Process:
        """Fetch published version of a process by parent_process_key."""
        query = cls.auth_query(
            cls.query.filter(
                and_(
                    cls.parent_process_key == parent_process_key,
                    cls.status == ProcessStatus.PUBLISHED,
                )
            )
        )
        return query.all()

    @classmethod
    def get_latest_version_by_parent_key(cls, parent_process_key):
        """Get latest version of process."""
        query = (
            cls.auth_query(
                cls.query.filter(cls.parent_process_key == parent_process_key)
            )
            .order_by(cls.major_version.desc(), cls.minor_version.desc(), cls.id.desc())
            .first()
        )

        return query

    @classmethod
    def fetch_histories_by_parent_process_key(
        cls, parent_process_key: str, page_no=None, limit=None
    ) -> List[Process]:
        """Fetch all versions (histories) of a process by process_name."""
        assert parent_process_key is not None

        query = cls.auth_query(
            cls.query.filter(
                and_(
                    cls.parent_process_key == parent_process_key,
                    cls.status_changed.is_(False),
                )
            )
        ).order_by(desc(cls.major_version), desc(cls.minor_version))
        total_count = query.count()
        limit = total_count if limit is None else limit
        query = query.paginate(page=page_no, per_page=limit, error_out=False)
        return query.items, total_count

    @classmethod
    def find_process_by_name_key(
        cls, name=None, process_key=None, parent_process_key=None
    ) -> Process:
        """Find all process that matches the provided name/key."""
        query = Process.query.filter(
            or_(Process.name == name, Process.process_key == process_key)
        )
        if parent_process_key:
            query = query.filter(Process.parent_process_key != parent_process_key)
        query = cls.auth_query(query=query)
        return query.all()

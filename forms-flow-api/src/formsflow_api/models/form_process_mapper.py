"""This manages Form ProcessMapper Database Models."""

from __future__ import annotations

from http import HTTPStatus

from flask import current_app
from sqlalchemy.sql.expression import text
from sqlalchemy import UniqueConstraint, and_, desc

from formsflow_api.exceptions import BusinessException
from formsflow_api.utils import FILTER_MAPS, validate_sort_order_and_order_by
from formsflow_api.utils.enums import FormProcessMapperStatus

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


class FormProcessMapper(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages form process mapper information."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(50), nullable=False)
    form_name = db.Column(db.String(100), nullable=False)
    process_key = db.Column(db.String(50), nullable=True)
    process_name = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(10), nullable=True)
    comments = db.Column(db.String(300), nullable=True)
    tenant = db.Column(db.String(100), nullable=True)
    application = db.relationship(
        "Application", backref="form_process_mapper", lazy=True
    )
    is_anonymous = db.Column(db.Boolean, nullable=True)
    deleted = db.Column(db.Boolean, nullable=True, default=False)
    version = db.Column(db.Integer, nullable=False, default=1)

    __table_args__ = (UniqueConstraint("form_id", "version", name="_form_version_uc"),)

    @classmethod
    def create_from_dict(cls, mapper_info: dict) -> FormProcessMapper:
        """Create new mapper between form and process."""
        try:
            if mapper_info:
                mapper = FormProcessMapper()
                mapper.form_id = mapper_info["form_id"]
                mapper.form_name = mapper_info["form_name"]
                mapper.process_key = mapper_info.get("process_key")
                mapper.process_name = mapper_info.get("process_name")
                mapper.status = mapper_info.get("status")
                mapper.comments = mapper_info.get("comments")
                mapper.created_by = mapper_info["created_by"]
                mapper.tenant = mapper_info.get("tenant")
                mapper.is_anonymous = mapper_info.get("is_anonymous")
                mapper.version = mapper_info.get("version")
                mapper.save()
                return mapper
        except KeyError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
        except Exception as err:  # pylint: disable=broad-except
            current_app.logger.critical(err)
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
        return response, status

    def update(self, mapper_info: dict):
        """Update form process mapper."""
        self.update_from_dict(
            [
                "form_id",
                "form_name",
                "form_revision_number",
                "process_key",
                "process_name",
                "status",
                "comments",
                "modified_by",
                "is_anonymous",
            ],
            mapper_info,
        )
        self.commit()

    def mark_inactive(self):
        """Mark form process mapper as inactive and deleted."""
        self.status: str = str(FormProcessMapperStatus.INACTIVE.value)
        self.deleted: bool = True
        self.commit()

    def mark_unpublished(self):
        """Mark form process mapper as inactive."""
        self.status: str = str(FormProcessMapperStatus.INACTIVE.value)
        self.commit()

    @classmethod
    def find_all(cls, page_number, limit):
        """Fetch all the form process mappers."""
        if page_number == 0:
            query = cls.query.order_by(FormProcessMapper.id.desc()).all()
        else:
            query = (
                cls.query.order_by(FormProcessMapper.id.desc())
                .paginate(page_number, limit, False)
                .items
            )
        return query

    @classmethod
    def filter_conditions(cls, **filters):
        """This method creates dynamic filter conditions based on the input param"""
        filter_conditions = []
        for key, value in filters.items():
            if value:
                filter_map = FILTER_MAPS[key]
                condition = FormProcessMapper.create_filter_condition(
                    model=FormProcessMapper,
                    column_name=filter_map["field"],
                    operator=filter_map["operator"],
                    value=value,
                )
                filter_conditions.append(condition)
        query = cls.query.filter(*filter_conditions) if filter_conditions else cls.query
        return query

    @classmethod
    def find_all_active(
        cls,
        page_number=None,
        limit=None,
        sort_by=None,
        sort_order=None,
        process_key=None,
        **filters,
    ):  # pylint: disable=too-many-arguments
        """Fetch all active form process mappers"""
        query = cls.filter_conditions(**filters)
        if process_key is not None:
            query = query.filter(FormProcessMapper.process_key.in_(process_key))
        query = query.filter(
            FormProcessMapper.status == str(FormProcessMapperStatus.ACTIVE.value)
        )
        sort_by, sort_order = validate_sort_order_and_order_by(sort_by, sort_order)
        if sort_by and sort_order:
            query = query.order_by(text(f"form_process_mapper.{sort_by} {sort_order}"))

        total_count = query.count()
        pagination = query.paginate(page_number, limit)
        return pagination.items, total_count

    @classmethod
    def find_all_count(cls):
        """Fetch the total active form process mapper which are active."""
        return cls.query.filter(
            FormProcessMapper.status == str(FormProcessMapperStatus.ACTIVE.value)
        ).count()

    @classmethod
    def find_form_by_id_active_status(cls, form_process_mapper_id) -> FormProcessMapper:
        """Find active form process mapper that matches the provided id."""
        return cls.query.filter(
            and_(
                FormProcessMapper.id == form_process_mapper_id,
                FormProcessMapper.status == str(FormProcessMapperStatus.ACTIVE.value),
            )
        ).first()  # pylint: disable=no-member

    @classmethod
    def find_form_by_id(cls, form_process_mapper_id) -> FormProcessMapper:
        """Find form process mapper that matches the provided id."""
        return cls.query.filter(FormProcessMapper.id == form_process_mapper_id).first()

    @classmethod
    def find_form_by_form_id(cls, form_id) -> FormProcessMapper:
        """Find form process mapper that matches the provided form_id."""
        return (
            cls.query.filter(
                FormProcessMapper.form_id == form_id,
            )
            .order_by(desc(FormProcessMapper.version))
            .limit(1)
            .first()
        )  # pylint: disable=no-member

    @classmethod
    def find_by_application_id(cls, application_id: int):
        """Fetch form process mapper details with application id."""
        where_condition = ""
        where_condition += f""" app.id  = {str(application_id)} """

        result_proxy = db.session.execute(
            f"""select
            mapper.id,mapper.process_key,mapper.process_name
            from application app, form_process_mapper mapper
            where app.form_process_mapper_id=mapper.id and
                {where_condition}
            """
        )
        try:
            result = []
            for row in result_proxy:
                info = dict(row)
                result.append(info)

            return result[0]
        except IndexError as err:
            current_app.logger.warning(err)
            return (
                "List index out of range",
                HTTPStatus.BAD_REQUEST,
            )
        except BusinessException as err:
            return err.error, err.status_code

    @classmethod
    def find_mapper_by_form_id_and_version(
        cls, form_id: int, version: int
    ) -> FormProcessMapper:
        """
        Return the form process mapper with given form_id and version.

        : form_id : form_id corresponding to the mapper
        : version : version corresponding to the mapper
        """
        query = cls.query.filter(
            and_(cls.form_id == form_id, cls.version == version)
        ).first()
        return query

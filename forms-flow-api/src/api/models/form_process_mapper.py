"""This manages appication Data."""

from __future__ import annotations
from http import HTTPStatus

from sqlalchemy import and_

from ..exceptions import BusinessException
from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db
from .enums import FormProcessMapperStatus


class FormProcessMapper(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages form process mapper imformation."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(50), nullable=False)
    form_name = db.Column(db.String(100), nullable=False)
    form_revision_number = db.Column(db.String(10), nullable=False)
    process_key = db.Column(db.String(50), nullable=True)
    process_name = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(10), nullable=True)
    comments = db.Column(db.String(300), nullable=True)
    tenant_id = db.Column(db.Integer, nullable=True)
    application = db.relationship(
        "Application", backref="form_process_mapper", lazy=True
    )

    @classmethod
    def create_from_dict(cls, mapper_info: dict) -> FormProcessMapper:
        """Create new mapper between form and process."""
        try:
            if mapper_info:
                mapper = FormProcessMapper()
                mapper.form_id = mapper_info["form_id"]
                mapper.form_name = mapper_info["form_name"]
                mapper.form_revision_number = mapper_info["form_revision_number"]
                mapper.process_key = mapper_info.get("process_key")
                mapper.process_name = mapper_info.get("process_name")
                mapper.status = mapper_info.get("status")
                mapper.comments = mapper_info.get("comments")
                mapper.created_by = mapper_info["created_by"]
                mapper.tenant_id = mapper_info.get("tenant_id")
                mapper.save()
                return mapper
        except BaseException as form_err:
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
            ],
            mapper_info,
        )
        self.commit()

    def mark_inactive(self):
        """Mark form process mapper as inactive."""
        self.status = str(FormProcessMapperStatus.Inactive.value)
        self.commit()

    @classmethod
    def find_all(cls, page_number, limit):
        """Fetch all the form process mappers."""
        if page_number == 0:
            return cls.query.order_by(FormProcessMapper.id.desc()).all()
        else:
            return (
                cls.query.order_by(FormProcessMapper.id.desc())
                .paginate(page_number, limit, False)
                .items
            )

    @classmethod
    def find_all_active(cls, page_number, limit):
        """Fetch all active form process mappers"""
        if page_number == 0:
            return (
                cls.query.filter(
                    FormProcessMapper.status
                    == str(FormProcessMapperStatus.Active.value)
                )
                .order_by(FormProcessMapper.id.desc())
                .all()
            )

        else:
            return (
                cls.query.filter(
                    FormProcessMapper.status
                    == str(FormProcessMapperStatus.Active.value)
                )
                .paginate(page_number, limit, False)
                .items
            )

    @classmethod
    def find_all_count(cls):
        """Fetch the total active form process mapper which are active."""
        return cls.query.filter(
            FormProcessMapper.status == str(FormProcessMapperStatus.Active.value)
        ).count()

    @classmethod
    def find_form_by_id_active_status(cls, form_process_mapper_id) -> FormProcessMapper:
        """Find active form process mapper that matches the provided id."""
        return cls.query.filter(
            and_(
                FormProcessMapper.id == form_process_mapper_id,
                FormProcessMapper.status == str(FormProcessMapperStatus.Active.value),
            )
        ).first()  # pylint: disable=no-member

    @classmethod
    def find_form_by_id(cls, form_process_mapper_id) -> FormProcessMapper:
        """Find form process mapper that matches the provided id."""
        return cls.query.filter(FormProcessMapper.id == form_process_mapper_id).first()

    @classmethod
    def find_form_by_form_id(cls, form_id) -> FormProcessMapper:
        """Find active form process mapper that matches the provided form_id."""
        return cls.query.filter(
            and_(
                FormProcessMapper.form_id == form_id,
            )
        ).first()  # pylint: disable=no-member

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
            return (
                "List index out of range",
                HTTPStatus.BAD_REQUEST,
            )
        except BusinessException as err:
            return err.error, err.status_code

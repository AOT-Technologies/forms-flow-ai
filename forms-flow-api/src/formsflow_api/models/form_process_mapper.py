"""This manages Form ProcessMapper Database Models."""

from __future__ import annotations
from http import HTTPStatus

from sqlalchemy import and_
from flask import current_app
from formsflow_api.exceptions import BusinessException
from formsflow_api.models import BaseModel, db
from formsflow_api.models.audit_mixin import AuditDateTimeMixin, AuditUserMixin
from formsflow_api.utils.enums import FormProcessMapperStatus


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
    def find_all_active(cls, page_number, limit, form_name=None):
        """Fetch all active form process mappers"""
        if form_name:
            return (
                cls.query.filter(
                    and_(
                        FormProcessMapper.form_name.ilike(f"%{form_name}%"),
                        FormProcessMapper.status
                        == str(FormProcessMapperStatus.ACTIVE.value),
                    )
                )
                .paginate(page_number, limit, False)
                .items
            )
        if page_number == 0:
            result = (
                cls.query.filter(
                    FormProcessMapper.status
                    == str(FormProcessMapperStatus.ACTIVE.value)
                )
                .order_by(FormProcessMapper.id.desc())
                .all()
            )

        else:
            result = (
                cls.query.filter(
                    FormProcessMapper.status
                    == str(FormProcessMapperStatus.ACTIVE.value)
                )
                .paginate(page_number, limit, False)
                .items
            )
        return result

    @classmethod
    def find_all_count(cls):
        """Fetch the total active form process mapper which are active."""
        return cls.query.filter(
            FormProcessMapper.status == str(FormProcessMapperStatus.ACTIVE.value)
        ).count()

    @classmethod
    def find_count_form_name(cls, form_name):
        return cls.query.filter(
            FormProcessMapper.form_name.ilike(f"%{form_name}%")
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
        return cls.query.filter(
            FormProcessMapper.form_id == form_id,
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
            current_app.logger.warning(err)
            return (
                "List index out of range",
                HTTPStatus.BAD_REQUEST,
            )
        except BusinessException as err:
            return err.error, err.status_code

"""This manages Application submission Data."""

from __future__ import annotations
from datetime import datetime
from flask import current_app
from sqlalchemy import and_, func, or_
from sqlalchemy.sql.expression import text

from formsflow_api.models.audit_mixin import AuditDateTimeMixin, AuditUserMixin
from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db
from formsflow_api.models.form_process_mapper import FormProcessMapper
from formsflow_api.utils import ApplicationSortingParameters


class Application(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages application against each form."""

    id = db.Column(db.Integer, primary_key=True)
    application_name = db.Column(db.String(100), nullable=False)
    application_status = db.Column(db.String(100), nullable=False)
    form_process_mapper_id = db.Column(
        db.Integer, db.ForeignKey("form_process_mapper.id"), nullable=False
    )
    form_url = db.Column(db.String(500), nullable=True)
    process_instance_id = db.Column(db.String(100), nullable=True)
    revision_no = db.Column(db.Integer, nullable=False)  # set 1 now

    @classmethod
    def create_from_dict(cls, application_info: dict) -> Application:
        """Create new application."""
        if application_info:
            application = Application()
            application.application_name = application_info["application_name"]
            application.application_status = application_info["application_status"]
            application.form_process_mapper_id = application_info[
                "form_process_mapper_id"
            ]
            application.form_url = application_info["form_url"]
            application.revision_no = 1  # application_info['revision_no']
            application.created_by = application_info["created_by"]
            application.save()
            return application
        return None

    def update(self, mapper_info: dict):
        """Update application."""
        self.update_from_dict(
            [
                "application_name",
                "application_status",
                "form_url",
                "form_process_mapper_id",
                "process_instance_id",
                "revision_no",
                "modified_by",
            ],
            mapper_info,
        )
        self.commit()

    @classmethod
    def find_by_id(cls, application_id: int) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter_by(id=application_id).first()

    @classmethod
    def find_all_application_status(cls):
        """Find all application status"""
        return cls.query.distinct(Application.application_status).all()

    @classmethod
    def find_by_ids(cls, application_ids) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter(cls.id.in_(application_ids)).order_by(
            Application.id.desc()
        )

    @classmethod
    def find_all(cls, page_no: int, limit: int) -> Application:
        """Fetch all application."""
        if page_no == 0:
            return cls.query.order_by(Application.id.desc()).all()
        else:
            return (
                cls.query.order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_all_by_user(
        cls,
        user_id: str,
        page_no: int,
        limit: int,
        order_by: str,
        application_id: int,
        application_name: str,
        application_status: str,
        created_by: str,
        modified_from: datetime,
        modified_to: datetime,
        sort_order: str,
        created_from: datetime,
        created_to: datetime,
    ) -> Application:
        """Fetch applications list based on searching parameters for Non-reviewer"""

        if (
            application_id
            and application_name
            and application_status
            and modified_from
            and modified_to
        ):
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_name and application_status:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
            )
        elif application_id and application_name and modified_from and modified_to:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_name and application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_name:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
            )
        elif application_id and application_status:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_status == application_status,
            )
        elif application_id and modified_from and modified_to:
            query = query = cls.query.filter(
                Application.id == application_id,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_name and application_status:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
            )
        elif application_name and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id:
            query = cls.query.filter(
                Application.id == application_id,
            )
        elif application_name:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
            )
        elif application_status:
            query = cls.query.filter(
                Application.application_status == application_status,
            )
        elif created_by:
            query = cls.query.filter(Application.created_by.like(f"{created_by}%"))
        elif modified_from and modified_to:
            query = cls.query.filter(
                and_(
                    Application.modified >= modified_from,
                    Application.modified <= modified_to,
                )
            )
        elif created_from and created_to:
            query = cls.query.filter(
                and_(
                    Application.created >= created_from,
                    Application.created <= created_to,
                )
            )
        else:
            query = cls.query
        query = query.filter(Application.created_by == user_id)

        if order_by == ApplicationSortingParameters.Id and sort_order == "asc":
            query = query.order_by(Application.id.asc())
        elif order_by == ApplicationSortingParameters.Id and sort_order == "desc":
            query = query.order_by(Application.id.desc())
        elif order_by == ApplicationSortingParameters.Name and sort_order == "asc":
            query = query.order_by(Application.application_name.asc())
        elif order_by == ApplicationSortingParameters.Name and sort_order == "desc":
            query = query.order_by(Application.application_name.desc())
        elif order_by == ApplicationSortingParameters.Status and sort_order == "asc":
            query = query.order_by(Application.application_status.asc())
        elif order_by == ApplicationSortingParameters.Status and sort_order == "desc":
            query = query.order_by(Application.application_status.desc())
        elif order_by == ApplicationSortingParameters.Modified and sort_order == "asc":
            query = query.order_by(Application.modified.asc())
        elif order_by == ApplicationSortingParameters.Modified and sort_order == "desc":
            query = query.order_by(Application.modified.desc())

        total_count = query.count()
        pagination = query.paginate(page_no, limit)
        return pagination.items, total_count

    @classmethod
    def find_all_by_user_group(cls, user_id: str, page_no: int, limit: int):
        if page_no == 0:
            return cls.query.filter(Application.created_by == user_id).order_by(
                Application.id.desc()
            )
        else:
            return (
                cls.query.filter(Application.created_by == user_id)
                .order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_id_by_user(cls, application_id: int, user_id: str) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter(
            and_(Application.id == application_id, Application.created_by == user_id)
        ).one_or_none()

    @classmethod
    def find_all_by_user_count(cls, user_id: str) -> Application:
        """Fetch all application."""
        return cls.query.filter(Application.created_by == user_id).count()

    @classmethod
    def find_by_form_id(cls, form_id, page_no: int, limit: int):
        if page_no == 0:
            return cls.query.filter(
                Application.form_url.like("%" + form_id + "%")
            ).order_by(Application.id.desc())
        else:
            return (
                cls.query.filter(Application.form_url.like("%" + form_id + "%"))
                .order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_by_form_names(
        cls,
        form_names: str,
        application_id: int,
        modified_from: datetime,
        modified_to: datetime,
        application_name: str,
        application_status: str,
        created_by: str,
        page_no: int,
        limit: int,
        order_by: str,
        sort_order: str,
        created_from: datetime,
        created_to: datetime,
    ):
        """Fetch applications list based on searching parameters for Reviewer"""
        if (
            application_id
            and application_name
            and application_status
            and modified_from
            and modified_to
        ):
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_name and application_status:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
            )
        elif application_id and application_name and modified_from and modified_to:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_name and application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id and application_name:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_name.like(f"{application_name}%"),
            )
        elif application_id and application_status:
            query = cls.query.filter(
                Application.id == application_id,
                Application.application_status == application_status,
            )
        elif application_id and modified_from and modified_to:
            query = query = cls.query.filter(
                Application.id == application_id,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_name and application_status:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.application_status == application_status,
            )
        elif application_name and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_status and modified_from and modified_to:
            query = cls.query.filter(
                Application.application_status == application_status,
                Application.modified >= modified_from,
                Application.modified <= modified_to,
            )
        elif application_id:
            query = cls.query.filter(
                Application.id == application_id,
            )
        elif application_name:
            query = cls.query.filter(
                Application.application_name.like(f"{application_name}%"),
            )
        elif application_status:
            query = cls.query.filter(
                Application.application_status == application_status,
            )
        elif created_by:
            query = cls.query.filter(Application.created_by.like(f"{created_by}%"))
        elif modified_from and modified_to:
            current_app.logger.debug((modified_from, modified_to))
            query = cls.query.filter(
                and_(
                    Application.modified <= modified_to,
                    Application.modified >= modified_from,
                )
            )
        elif created_from and created_to:
            query = cls.query.filter(
                and_(
                    Application.created >= created_from,
                    Application.created <= created_to,
                )
            )
        else:
            query = cls.query
        query = query.filter(Application.application_name.in_(form_names))

        if order_by == ApplicationSortingParameters.Id and sort_order == "asc":
            query = query.order_by(Application.id.asc())
        elif order_by == ApplicationSortingParameters.Id and sort_order == "desc":
            query = query.order_by(Application.id.desc())
        elif order_by == ApplicationSortingParameters.Name and sort_order == "asc":
            query = query.order_by(Application.application_name.asc())
        elif order_by == ApplicationSortingParameters.Name and sort_order == "desc":
            query = query.order_by(Application.application_name.desc())
        elif order_by == ApplicationSortingParameters.Status and sort_order == "asc":
            query = query.order_by(Application.application_status.asc())
        elif order_by == ApplicationSortingParameters.Status and sort_order == "desc":
            query = query.order_by(Application.application_status.desc())
        elif order_by == ApplicationSortingParameters.Modified and sort_order == "asc":
            query = query.order_by(Application.modified.asc())
        elif order_by == ApplicationSortingParameters.Modified and sort_order == "desc":
            query = query.order_by(Application.modified.desc())

        total_count = query.count()
        pagination = query.paginate(page_no, limit)
        return pagination.items, total_count

    @classmethod
    def find_all_applications(cls, page_no: int, limit: int, form_names: str):
        if page_no == 0:
            return cls.query.filter(
                Application.application_name.in_(form_names)
            ).order_by(Application.id.desc())
        else:
            return (
                cls.query.filter(Application.application_name.in_(form_names))
                .order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_id_by_form_names(cls, application_id: int, form_names):
        return cls.query.filter(
            and_(
                Application.application_name.in_(form_names),
                Application.id == application_id,
            )
        ).one_or_none()

    @classmethod
    def find_by_form_id_user(cls, form_id, user_id: str, page_no: int, limit: int):
        if page_no == 0:
            return (
                cls.query.filter(Application.form_url.like("%" + form_id + "%"))
                .filter(Application.created_by == user_id)
                .order_by(Application.id.desc())
            )
        else:
            return (
                cls.query.filter(Application.form_url.like("%" + form_id + "%"))
                .filter(Application.created_by == user_id)
                .order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_by_form_ids(cls, form_ids, page_no: int, limit: int):
        """Fetch application based on multiple form ids."""
        if page_no == 0:
            return cls.query.filter(
                or_(
                    Application.form_url.like("%" + form_id + "%")
                    for form_id in form_ids
                )
            ).order_by(Application.id.desc())
        else:
            return (
                cls.query.filter(
                    or_(
                        Application.form_url.like("%" + form_id + "%")
                        for form_id in form_ids
                    )
                )
                .order_by(Application.id.desc())
                .paginate(page_no, limit, False)
                .items
            )

    @classmethod
    def find_all_by_form_id_count(cls, form_id):
        """Fetch all application."""
        return cls.query.filter(Application.form_url.like("%" + form_id + "%")).count()

    @classmethod
    def find_all_by_form_id_user_count(cls, form_id, user_id: str):
        """Fetch all application."""
        return (
            cls.query.filter(Application.form_url.like("%" + form_id + "%"))
            .filter(Application.created_by == user_id)
            .count()
        )

    @classmethod
    def find_aggregated_applications(cls, from_date: str, to_date: str):
        """Fetch aggregated applications."""
        result_proxy = (
            db.session.query(
                Application.form_process_mapper_id,
                FormProcessMapper.form_name,
                func.count(Application.form_process_mapper_id).label("count"),
            )
            .join(
                FormProcessMapper,
                FormProcessMapper.id == Application.form_process_mapper_id,
            )
            .filter(
                and_(
                    Application.modified >= from_date,
                    Application.modified <= to_date,
                )
            )
            .group_by(Application.form_process_mapper_id, FormProcessMapper.form_name)
        )

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

    @classmethod
    def find_aggregated_applications_modified(
        cls, from_date: datetime, to_date: datetime
    ):
        """Fetch aggregated applications."""
        result_proxy = (
            db.session.query(
                Application.form_process_mapper_id,
                FormProcessMapper.form_name,
                func.count(Application.form_process_mapper_id).label("count"),
            )
            .join(
                FormProcessMapper,
                FormProcessMapper.id == Application.form_process_mapper_id,
            )
            .filter(
                and_(
                    Application.modified >= from_date,
                    Application.modified <= to_date,
                )
            )
            .group_by(Application.form_process_mapper_id, FormProcessMapper.form_name)
        )

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

    @classmethod
    def find_aggregated_application_status(
        cls, mapper_id: int, from_date: str, to_date: str
    ):
        """Fetch aggregated application status."""
        result_proxy = (
            db.session.query(
                Application.application_status,
                Application.application_name,
                func.count(Application.application_name).label("count"),
            )
            .join(
                FormProcessMapper,
                FormProcessMapper.id == Application.form_process_mapper_id,
            )
            .filter(
                and_(
                    Application.created >= from_date,
                    Application.created <= to_date,
                    Application.form_process_mapper_id == mapper_id,
                )
            )
            .group_by(Application.application_status, Application.application_name)
        )

        return result_proxy

    @classmethod
    def find_aggregated_application_status_modified(
        cls, mapper_id: int, from_date: str, to_date: str
    ):
        """Fetch aggregated application status."""
        result_proxy = (
            db.session.query(
                Application.application_name,
                Application.application_status,
                func.count(Application.application_name).label("count"),
            )
            .filter(
                and_(
                    Application.modified >= from_date,
                    Application.modified <= to_date,
                    Application.form_process_mapper_id == mapper_id,
                )
            )
            .group_by(Application.application_name, Application.application_status)
        )

        return result_proxy

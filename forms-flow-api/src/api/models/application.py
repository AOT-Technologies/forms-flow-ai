"""This manages Application submission Data."""

from __future__ import annotations

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db


class Application(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages application against each form."""

    id = db.Column(db.Integer, primary_key=True)
    application_name = db.Column(db.String(100), nullable=False)
    application_status = db.Column(db.String(50), nullable=False)
    form_process_mapper_id = db.Column(db.Integer, db.ForeignKey('form_process_mapper.id'), nullable=False)
    form_url = db.Column(db.String(500), nullable=True)
    process_instance_id = db.Column(db.String(100), nullable=True)
    revision_no = db.Column(db.Integer, nullable=False)  # set 1 now

    @classmethod
    def create_from_dict(cls, application_info: dict) -> Application:
        """Create new application."""
        if application_info:
            application = Application()
            application.application_name = application_info['application_name']
            application.application_status = application_info['application_status']
            application.form_process_mapper_id = application_info['form_process_mapper_id']
            application.form_url = application_info['form_url']
            application.revision_no = 1  # application_info['revision_no']
            application.created_by = application_info['created_by']
            application.save()
            return application
        return None

    def update(self, mapper_info: dict):
        """Update application."""
        self.update_from_dict(
            ['application_name', 'application_status', 'form_url', 'form_process_mapper_id',
             'process_instance_id', 'revision_no',
             'modified_by'],
            mapper_info)
        self.commit()

    @classmethod
    def find_by_id(cls, application_id) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter_by(id=application_id).first()

    @classmethod
    def find_by_ids(cls, application_ids) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter(cls.id.in_(application_ids)).order_by(Application.id.desc())

    @classmethod
    def find_all(cls, page_no, limit):
        """Fetch all application."""
        if page_no == 0:
            return cls.query.order_by(Application.id.desc()).all()
        else:
            return cls.query.order_by(Application.id.desc()).paginate(page_no, limit, False).items

    @classmethod
    def find_all_by_user(cls, user_id, page_no, limit):
        if page_no == 0:
            return cls.query.filter(Application.created_by == user_id).order_by(Application.id.desc())
        else:
            return cls.query.filter(Application.created_by == user_id).order_by(Application.id.desc()).paginate(page_no, limit, False).items

    @classmethod
    def find_all_by_user_count(cls, user_id):
        """Fetch all application."""
        return cls.query.filter(Application.created_by == user_id).count()

    @classmethod
    def find_by_form_id(cls, form_id, page_no, limit):
        if page_no == 0:
            return cls.query.filter(Application.form_url.like('%'+form_id+'%')).order_by(Application.id.desc())
        else:
            return cls.query.filter(Application.form_url.like('%'+form_id+'%')).order_by(Application.id.desc()).paginate(page_no, limit, False).items

    @classmethod
    def find_by_form_id_user(cls, form_id, user_id, page_no, limit):
        if page_no == 0:
            return cls.query.filter(Application.form_url.like('%'+form_id+'%')).filter(Application.created_by == user_id).order_by(Application.id.desc())
        else:
            return cls.query.filter(Application.form_url.like('%'+form_id+'%')).filter(Application.created_by == user_id).order_by(Application.id.desc()).paginate(page_no, limit, False).items




    @classmethod
    def find_all_by_form_id_count(cls, form_id):
        """Fetch all application."""
        return cls.query.filter(Application.form_url.like('%'+form_id+'%')).count()


    @classmethod
    def find_all_by_form_id_user_count(cls, form_id, user_id):
        """Fetch all application."""
        return cls.query.filter(Application.form_url.like('%'+form_id+'%')).filter(Application.created_by == user_id).count()


    @classmethod
    def find_aggregated_applications(cls, from_date: str, to_date: str):
        """Fetch aggregated applications."""
        where_condition = ''
        if from_date == to_date:
            where_condition = f"""DATE(app.created) = '{from_date}'"""
        else:
            where_condition = f"""DATE(app.created) BETWEEN '{from_date}' AND '{to_date}'"""
        result_proxy = db.session.execute(f"""SELECT
                app.form_process_mapper_id,
                mapper.form_name,
                count(app.form_process_mapper_id) as count
            FROM "application" AS app
            INNER JOIN "form_process_mapper" mapper ON mapper.id = app.form_process_mapper_id
            WHERE
                {where_condition}
            GROUP BY
                app.form_process_mapper_id, mapper.form_name
            ORDER BY form_name""")

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

    @classmethod
    def find_aggregated_application_status(cls, mapper_id: int, from_date: str, to_date: str):
        """Fetch aggregated application status."""
        where_condition = ''
        if from_date == to_date:
            where_condition = f"""DATE(app.created) = '{from_date}'"""
        else:
            where_condition = f"""(DATE(app.created) BETWEEN '{from_date}' AND '{to_date}')"""

        where_condition += f""" AND app.form_process_mapper_id = {str(mapper_id)} """

        result_proxy = db.session.execute(f"""SELECT
                mapper.form_name,
                app.application_status,
                count(app.form_process_mapper_id) as count
            FROM "application" AS app
            INNER JOIN "form_process_mapper" mapper ON mapper.id = app.form_process_mapper_id
            WHERE
                {where_condition}
            GROUP BY
                app.application_status, mapper.form_name
            ORDER BY application_status""")

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

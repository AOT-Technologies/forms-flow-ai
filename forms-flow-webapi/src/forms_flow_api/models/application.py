"""This manages Application Data."""
from .base_model import BaseModel
from .db import db


class Application(BaseModel, db.Model):
    """Application Model for storing application related details."""

    __tablename__ = 'FAI_APPLICATION'

    application_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    application_name = db.Column(db.String(100), nullable=False)
    application_status = db.Column(db.String(10), nullable=False)
    mapper_id = db.Column(db.ForeignKey('FORM_PROCESS_MAPPER.mapper_id'), nullable=False)
    created_by = db.Column(db.String(20), nullable=False)
    created_on = db.Column(db.Date(), nullable=False)
    modified_by = db.Column(db.String(20), nullable=False)
    modified_on = db.Column(db.Date(), nullable=False)
    submission_id = db.Column(db.String(30), nullable=False)
    process_instance_id = db.Column(db.String(30), nullable=False)
    revision_no = db.Column(db.Integer, nullable=False)

    FORM_PROCESS_MAPPER = db.relationship(
        'Process',
        primaryjoin='Application.mapper_id == Process.mapper_id',
        backref='FAI_APPLICATION')

    @classmethod
    def find_aggregated_applications(cls, from_date: str, to_date: str):
        """Fetch aggregated applications."""
        where_condition = ''
        if from_date == to_date:
            where_condition = f"""app.created_on = '{from_date}'"""
        else:
            where_condition = f"""app.created_on BETWEEN '{from_date}' AND '{to_date}'"""
        result_proxy = db.session.execute(f"""SELECT
                app.mapper_id,
                mapper.form_name,
                count(app.mapper_id) as count
            FROM "FAI_APPLICATION" AS app
            INNER JOIN "FORM_PROCESS_MAPPER" mapper ON mapper.mapper_id = app.mapper_id
            WHERE
                {where_condition}
            GROUP BY
                app.mapper_id, mapper.form_name
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
            where_condition = f"""app.created_on = '{from_date}'"""
        else:
            where_condition = f"""(app.created_on BETWEEN '{from_date}' AND '{to_date}')"""

        where_condition += f""" AND app.mapper_id = {str(mapper_id)} """

        result_proxy = db.session.execute(f"""SELECT
                mapper.form_name,
                app.application_status,
                count(app.mapper_id) as count
            FROM "FAI_APPLICATION" AS app
            INNER JOIN "FORM_PROCESS_MAPPER" mapper ON mapper.mapper_id = app.mapper_id
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

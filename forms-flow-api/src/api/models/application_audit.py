"""This manages Application audit data."""
from .base_model import BaseModel
from .db import db


class ApplicationAudit(BaseModel, db.Model):
    """This class manages application audit against each form."""

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer,nullable=False)
    application_status = db.Column(db.String(50), nullable=False)
    form_uri = db.Column(db.String(100), nullable=False)
    created = db.Column(db.DateTime, nullable=False)

    @classmethod
    def get_application_history(cls, application_id: int):
        """Fetch application history."""
        where_condition = ''
        where_condition += f""" audit.application_id = {str(application_id)} """

        result_proxy = db.session.execute(f"""SELECT
                audit.application_status,
                audit.form_uri,
                audit.created,
                count(audit.application_status) as count
            FROM "application_audit" audit
            WHERE
                {where_condition}
            GROUP BY (application_status,form_uri,created)    
            ORDER BY created
            """)

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

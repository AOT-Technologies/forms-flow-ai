"""This manages Application audit data."""
from __future__ import annotations

from .audit_mixin import ApplicationAuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class ApplicationHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages application audit against each form."""
    __tablename__ = "application_audit"
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, nullable=False)
    application_status = db.Column(db.String(100), nullable=False)
    form_url = db.Column(db.String(500), nullable=False)

    @classmethod
    def create_from_dict(cls, application_audit_info: dict) -> ApplicationAudit:
        """Create new application."""
        if application_audit_info:
            application_audit = ApplicationHistory()
            application_audit.application_id = application_audit_info["application_id"]
            application_audit.application_status = application_audit_info[
                "application_status"
            ]
            application_audit.form_url = application_audit_info["form_url"]
            application_audit.save()
            return application_audit
        return None

    @classmethod
    def get_application_history(cls, application_id: int):
        """Fetch application history."""
        where_condition = ""
        where_condition += f""" audit.application_id = {str(application_id)} """

        result_proxy = db.session.execute(
            f"""SELECT
                audit.application_status,
                audit.form_url,
                audit.created,
                count(audit.application_status) as count
            FROM "application_audit" audit
            WHERE
                {where_condition}
            GROUP BY (application_status,form_url,created)    
            ORDER BY created
            """
        )

        result = []
        for row in result_proxy:
            info = dict(row)
            result.append(info)

        return result

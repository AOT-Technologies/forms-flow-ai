"""This is form logs model."""

from sqlalchemy.dialects.postgresql import ARRAY, JSON
from .base_model import BaseModel
from .db import db


class FormLogs(BaseModel, db.Model):
    """This is for creating form logs."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(30), nullable=False)
    logs = db.Column(ARRAY(JSON), nullable=False)

    @classmethod
    def create_form_log(cls, data):
        """This method will create form logs in db."""
        form_log = FormLogs()
        form_log.form_id = data["form_id"]
        form_log.logs = data["logs"]
        form_log.save()
        return form_log

    @classmethod
    def get_form_logs(cls, form_id):
        """Return the logs against form id."""
        return cls.query.filter(cls.form_id == form_id).one_or_none()

    @classmethod
    def update_form_logs(cls, form_id, data):
        """Update form logs against form id."""
        form_logs = cls.query.filter(cls.form_id == form_id).one_or_none()
        if form_logs:
            form_logs.logs = [*form_logs.logs, data]
            cls.commit()
            return form_logs
        return None

    @classmethod
    def delete_form_logs(cls, form_id):
        """Delete form logs."""
        cls.query.filter(cls.form_id == form_id).delete()
        cls.commit()

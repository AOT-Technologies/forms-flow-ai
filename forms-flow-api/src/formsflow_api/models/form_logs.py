"""This is form logs model."""

from .base_model import BaseModel
from .db import db


class FormLogs(BaseModel, db.Model):
    """This is for creating form logs."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(30), nullable=False)
    mapper_id = db.Column(
        db.Integer, db.ForeignKey("form_process_mapper.id"), nullable=False
    )
    form_name = db.Column(db.String(100), nullable=False)
    process_key = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(100), nullable=False)
    created = db.Column(db.String(100), nullable=False)
    created_by = db.Column(db.String(100), nullable=False)

    @classmethod
    def create_form_log(cls, data):
        """This method will create form logs in db."""
        form_log = FormLogs()
        form_log.form_id = data["form_id"]
        form_log.form_name = data["form_name"]
        form_log.mapper_id = data["mapper_id"]
        form_log.process_key = data["process_key"]
        form_log.status = data["status"]
        form_log.created_by = data["created_by"]
        form_log.created = data["created"]
        form_log.save()
        return form_log

    @classmethod
    def get_form_logs(cls, form_id):
        """Return the logs against form id."""
        return cls.query.filter(cls.form_id == form_id).all()

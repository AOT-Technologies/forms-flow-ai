"""This manages Application audit data."""
from .base_model import BaseModel
from .db import db


class ApplicationAudit(BaseModel, db.Model):
    """This class manages application audit against each form."""

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer)
    application_name = db.Column(db.String(100), nullable=False)
    application_status = db.Column(db.String(50), nullable=False)
    form_process_mapper_id = db.Column(db.Integer, nullable=False)
    form_submission_id = db.Column(db.String(30), nullable=False)
    process_instance_id = db.Column(db.String(30), nullable=False)
    revision_no = db.Column(db.Integer, nullable=False)

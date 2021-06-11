"""This manages Application Communication Data."""

from .base_model import BaseModel
from .db import db


class ApplicationCommunication(BaseModel, db.Model):
    """This class manages ApplicationCommunication."""

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(
        db.Integer, db.ForeignKey("application.id"), nullable=False
    )
    message = db.Column(db.String(3000), nullable=False)
    created_by = db.Column(db.String(), nullable=False)
    created = db.Column(db.DateTime, nullable=False)

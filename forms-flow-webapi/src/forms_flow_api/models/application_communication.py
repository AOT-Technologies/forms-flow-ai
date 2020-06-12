"""This manages Application Communication Data."""
from .base_model import BaseModel
from .db import db


class ApplicationCommunication(BaseModel, db.Model):
    """ApplicationCommunication Model for storing application communication related details."""

    __tablename__ = 'FAI_APPLICATION_COMMUNICATION'

    communication_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    application_id = db.Column(db.ForeignKey('FAI_APPLICATION.application_id'), nullable=False)
    message = db.Column(db.String(3000), nullable=False)
    created_by = db.Column(db.String(20), nullable=False)
    created_on = db.Column(db.Date(), nullable=False)

    FAI_APPLICATION = db.relationship(
        'Application',
        primaryjoin='ApplicationCommunication.application_id == Application.application_id',
        backref='FAI_APPLICATION_COMMUNICATION')

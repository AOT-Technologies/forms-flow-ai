"""This manages Form Bundling Database Models."""

from sqlalchemy.dialects.postgresql import ARRAY

from .base_model import BaseModel
from .db import db


class FormBundling(BaseModel, db.Model):
    """This class manages form bundling information."""

    id = db.Column(db.Integer, primary_key=True)
    rules = db.Column(ARRAY(db.String), nullable=True, comment="Rules for bundling")
    path_name = db.Column(
        db.String(100), nullable=False, comment="Path name of form inside bundle"
    )
    mapper_id = db.Column(
        db.Integer, nullable=False, comment="mapper id of form inside bundle"
    )
    form_process_mapper_id = db.Column(
        db.Integer,
        db.ForeignKey("form_process_mapper.id"),
        nullable=False,
        comment="Mapper id of bundle",
    )
    form_order = db.Column(
        db.Integer, nullable=False, comment="Order of forms inside bundle"
    )
    parent_form_id = db.Column(
        db.String(50), nullable=False, comment="parent id of form inside bundle"
    )

"""This manages Form Bundling Database Models."""

from __future__ import annotations

from typing import List

from sqlalchemy.dialects.postgresql import ARRAY

from .base_model import BaseModel
from .db import db
from .form_process_mapper import FormProcessMapper


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

    @classmethod
    def create_from_dict(cls, mapper_info: dict):
        """Create new mapper between form and process."""
        form_bundlings = []
        for form_info in mapper_info["selected_forms"]:
            form_bundling = cls()
            form_bundling.rules = form_info.get("rules")
            form_bundling.path_name = form_info.get("path")
            form_bundling.mapper_id = form_info.get("mapper_id")
            form_bundling.form_process_mapper_id = form_info.get(
                "form_process_mapper_id"
            )
            form_bundling.form_order = form_info.get("form_order")
            form_bundling.parent_form_id = form_info.get("parent_formId")
            form_bundlings.append(form_bundling)
        db.session.add_all(form_bundlings)
        db.session.commit()
        return form_bundlings

    @classmethod
    def find_by_form_process_mapper_id(cls, mapper_id: int) -> List[FormBundling]:
        """Find and return the form bundling record by form process mapper id."""
        query = cls.query.join(
            FormProcessMapper, cls.form_process_mapper_id == FormProcessMapper.id
        )
        query = query.filter(cls.form_process_mapper_id == mapper_id)
        return FormProcessMapper.tenant_authorization(query=query).all()

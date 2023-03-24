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
            form_bundling.form_process_mapper_id = form_info.get(
                "form_process_mapper_id"
            )
            form_bundling.form_order = form_info.get("form_order")
            form_bundling.parent_form_id = form_info.get("parent_form_id")
            form_bundlings.append(form_bundling)
        db.session.add_all(form_bundlings)
        db.session.commit()
        return form_bundlings

    @classmethod
    def update_bundle_from_dict(cls, mapper_id, form_bundle_info: dict):
        """Update bundle from the dict.

        1: Create new entry for new addition.
        2: Delete any entry which is not existing in new list.
        3: Update records for existing records.
        """
        existing_bundles = FormBundling.find_by_form_process_mapper_id(mapper_id)
        # list of updated bundles, i.e, entries with "id"
        updated_bundles = [
            selected_form.get("id")
            for selected_form in form_bundle_info.get("selected_forms")
            if selected_form.get("id") is not None
        ]
        # list of bundles in existing_bundle but not in new data.
        deleted_bundles = [
            existing_bundle
            for existing_bundle in existing_bundles
            if existing_bundle.id not in updated_bundles
        ]

        form_bundles = []
        for form_info in form_bundle_info["selected_forms"]:
            if (_id := form_info.get("id")) is None:
                form_bundling = cls()
                db.session.add(form_bundling)
            else:
                form_bundling = FormBundling.find_by_id(_id)

            form_bundling.rules = form_info.get("rules")
            form_bundling.form_process_mapper_id = form_info.get(
                "form_process_mapper_id"
            )
            form_bundling.form_order = form_info.get("form_order")
            form_bundling.parent_form_id = form_info.get("parent_form_id")
            form_bundles.append(form_bundling)

        for deleted_bundle in deleted_bundles:
            deleted_bundle.delete()
        db.session.commit()

        return form_bundles

    @classmethod
    def find_by_form_process_mapper_id(cls, mapper_id: int) -> List[FormBundling]:
        """Find and return the form bundling record by form process mapper id."""
        query = cls.query.join(
            FormProcessMapper, cls.form_process_mapper_id == FormProcessMapper.id
        )
        query = query.filter(cls.form_process_mapper_id == mapper_id)
        return FormProcessMapper.tenant_authorization(query=query).all()

    @classmethod
    def find_by_id(cls, _id: int) -> FormBundling:
        """Find and return the form bundling record by id."""
        return cls.query.get(_id)

    @classmethod
    def delete_by_parent_form_id(cls, parent_form_id: str):
        """Delete form bundling records by parent id."""
        cls.query.filter(cls.parent_form_id == parent_form_id).delete()
        db.session.commit()

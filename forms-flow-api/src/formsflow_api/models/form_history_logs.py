"""This manages Form history information."""
from typing import List
from sqlalchemy import JSON, and_, or_
from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db

from .audit_mixin import ApplicationAuditDateTimeMixin


class FormHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages filter information."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String, index=True, nullable=False)
    created_by = db.Column(db.String, nullable=False)
    change_log = db.Column(JSON,nullable=False)
    workflow = db.Column(db.Boolean, nullable=True)
    title = db.Column(db.Boolean, nullable=True)
    component_change = db.Column(db.Boolean, nullable=True)
    anonymous = db.Column(db.Boolean, nullable=True)
    status = db.Column(db.Boolean, nullable=True)

    @classmethod
    def create_history(cls, data) -> "FormHistory":
        """Creating form history"""
        if data:
            history = FormHistory()
            history.form_id = data.get("form_id")
            history.cloned_form_id = data.get("cloned_form_id")
            history.created_by = data.get("created_by")
            history.change_log = data.get("change_log")
            history.workflow = data.get("workflow")
            history.title = data.get("title")
            history.status = data.get("status")
            history.component_change = data.get("component_change")
            history.anonymous = data.get("anonymous")
            history.status = data.get("status")
            history.save()
            return history
        return None

    @classmethod
    def fetch_histories_by_parent_id(cls, form_id) -> List["FormHistory"]:
        """Fetch all histories against a form id"""
        assert form_id is not None
        return cls.query.filter(cls.form_id == form_id and cls.component_change == True).all()

    @classmethod
    def get_count_of_all_history(cls, parent_id) -> List["FormHistory"]:
        """Get all count fo history"""
        assert parent_id is not None
        return cls.query.filter(cls.id == parent_id and cls.component_change == True).count()

"""This manages Form history information."""
from typing import List

from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db

from .audit_mixin import ApplicationAuditDateTimeMixin


class FormHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages filter information."""

    id = db.Column(db.Integer, primary_key=True)
    parent_form_id = db.Column(db.String, index=True, nullable=False)
    clone_id = db.Column(db.String, nullable=False)
    created_by = db.Column(db.String, nullable=False)
    
    @classmethod
    def create_history(cls, data) -> 'FormHistory':
        if data:
            history = FormHistory()
            history.parent_form_id = data.get('parent_form_id')
            history.cloned_form_id = data.get('cloned_form_id')
            history.created_by = data.get('created_by')
            history.save()
            return history
        return None
    
    @classmethod
    def fetch_history_by_parent_id(cls, parent_id) -> List['FormHistory']:
        assert parent_id is not None
        return cls.query.filter(cls.id == parent_id).all()
    
    @classmethod
    def get_count_of_all_history(cls, parent_id) -> List['FormHistory']:
        assert parent_id is not None
        return cls.query.filter(cls.id == parent_id).count()
        
 

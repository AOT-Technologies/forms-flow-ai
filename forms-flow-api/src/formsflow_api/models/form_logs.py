"""This manages Form Logs Database Models."""


from __future__ import annotations
 
 
 
 
from sqlalchemy.dialects.postgresql import JSON, ARRAY

from .base_model import BaseModel
from .db import db



class FormLog(BaseModel, db.Model):
    """This class manages form log."""
    id = db.Column(db.Integer, primary_key=True)
    formId = db.Column(db.String(100), nullable=False)
    logs = db.Column(ARRAY(JSON), nullable=False)
    
    @classmethod
    def create_form_log(cls, data):
        
        if data:
            form_log = FormLog()
            form_log.formId = data['formId']
            form_log.logs = data['logs']
        
            form_log.save()
            return form_log
        return None
    
    
            
        
        
    
    
    
    

    

   

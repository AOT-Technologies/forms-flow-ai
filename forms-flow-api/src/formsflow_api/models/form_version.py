"""This manages Submission Database Models."""
 
 
 
from sqlalchemy import JSON, ARRAY
from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db
 


class FormVersions(AuditDateTimeMixin, BaseModel, db.Model):
    """This class manages submission information."""

    __tablename__ = "form_versions"
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String, nullable=False , unique=True)
    restored = db.Column(db.Boolean(), default=False)
    restored_id = db.Column(db.String, nullable=True)
    versions = db.Column(ARRAY(JSON), nullable=False , default=[])
    
    
    @classmethod
    def create_form_versions(cls, form_version_data):
        
        if form_version_data:
            form_version_obj = FormVersions()
            form_version_obj["form_id"]= form_version_data["form_id"]
            form_version_obj.save()
            return form_version_obj
    
    @classmethod
    def get_form_versions(cls, form_id):
        
        if form_id:
            form_versions = cls.query.filter(cls.form_id == form_id).one_or_none()
            return form_versions
        return None
    @classmethod
    def update_form_versions(cls, form_data):
        
        if form_data:
            form_versions = cls.query.filter(cls.form_id == form_data["form_id"]).one_or_none()
            if form_versions:
                form_versions["restored"]= form_data.get("restored")
                form_versions["restored_id"] = form_data.get("restored_id","")
                if form_data.get("version"):
                    form_versions["verisons"] = [form_data["version"],*form_versions['versions']]
                    
                cls.commit()
                return form_versions
        return None
                    


            

 
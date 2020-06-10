"""This manages Applications."""

from __future__ import annotations

from datetime import datetime as dt

from .base_model import BaseModel
from .db import db, ma
class Process(BaseModel, db.Model):
    """Process Model for storing process related process."""

    __tablename__ = 'FORM_PROCESS_MAPPER'

    mapper_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    form_id = db.Column(db.String(50), nullable=False)
    form_name = db.Column(db.String(100), nullable=False)
    form_revision_number = db.Column(db.String(10), nullable=False)
    process_definition_key = db.Column(db.String(50), nullable=False)
    process_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    comments = db.Column(db.String(300), nullable=True)
    created_by = db.Column(db.String(20), nullable=False)
    created_on = db.Column(db.Date(), nullable=False)
    modified_by = db.Column(db.String(20), nullable=False)
    modified_on = db.Column(db.Date(), nullable=False)
    tenant_id = db.Column(db.String(50), nullable=False)

    @classmethod
    def create_from_dict(cls, application_info: dict) -> application:
        """Create a new application from"""
        if application_info:
            application = Process()
            application.form_id = application_info['form_id']
            application.form_name = application_info['form_name']
            application.form_revision_number = application_info['form_revision_number']
            application.process_definition_key = application_info['process_definition_key']
            application.process_name = application_info['process_name']
            application.form_id = ApplicationStatus.Active,
            application.form_name = application_info['comments']
            application.form_revision_number = application_info['created_by']
            application.process_definition_key = dt.utcnow(),
            application.process_name = application_info['modified_by']
            application.modified_on=dt.utcnow(),
            application.tenant_id=application_info['tenant_id']
            application_info.save()
            return application
        return None

    def update(self, application_info: dict):
        """Update application."""
        self.update_from_dict(['form_id', 'form_name', 'form_revision_number', 'process_definition_key', 'process_name','comments','modified_by','tenant_id'],
                              application_info)
        self.commit()
    
    def delete(cls, application):
        """delete application."""
        cls.update_from_dict(['status'],
                              application)
        cls.commit()

    @classmethod
    def find_all(cls,page_number, limit):
        """Fetch all applications."""
        return cls.query.filter_by(status='active').paginate(page_number, limit, False).items

    @classmethod
    def find_by_id(cls, application_id) -> Application:
        """Find application that matches the provided id."""
        return cls.query.filter(Process.mapper_id == application_id,Process.status=='active').first()


class ApplicationSchema(ma.ModelSchema):
    class Meta:
        model = Process
        include_fk = True


class ProcessSchema(ma.Schema):
    class Meta:
        # Fields to expose
        fields = ('key', 'name')


process_schema = ProcessSchema()
processes_schema = ProcessSchema(many=True)
application_schema = ApplicationSchema()
applications_schema = ApplicationSchema(many=True)

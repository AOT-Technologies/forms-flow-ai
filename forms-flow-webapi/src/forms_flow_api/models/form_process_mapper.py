"""This manages appication Data."""

from __future__ import annotations

from sqlalchemy import and_

from .audit_mixin import AuditDateTimeMixin, AuditUserMixin
from .base_model import BaseModel
from .db import db
from .enums import FormProcessMapperStatus


class FormProcessMapper(AuditDateTimeMixin, AuditUserMixin, BaseModel, db.Model):
    """This class manages form process mapper imformation."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(50), nullable=False)
    form_name = db.Column(db.String(100), nullable=False)
    form_revision_number = db.Column(db.String(10), nullable=False)
    process_key = db.Column(db.String(50), nullable=False)
    process_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    comments = db.Column(db.String(300), nullable=True)
    tenant_id = db.Column(db.Integer, nullable=True)

    application = db.relationship('Application', backref='form_process_mapper', lazy=True)

    @classmethod
    def create_from_dict(cls, mapper_info: dict) -> FormProcessMapper:
        """Create new mapper between form and process."""
        if mapper_info:
            mapper = FormProcessMapper()
            mapper.form_id = mapper_info['form_id']
            mapper.form_name = mapper_info['form_name']
            mapper.form_revision_number = mapper_info['form_revision_number']
            mapper.process_key = mapper_info['process_key']
            mapper.process_name = mapper_info['process_name']
            mapper.status = FormProcessMapperStatus.Active
            mapper.comments = mapper_info['comments']
            mapper.created_by = mapper_info['created_by']
            mapper.tenant_id = mapper_info.get('tenant_id')
            mapper.save()
            return mapper
        return None

    def update(self, mapper_info: dict):
        """Update form process mapper."""
        self.update_from_dict(
            ['form_id', 'form_name', 'form_revision_number',
             'process_key', 'process_name', 'comments',
             'modified_by'],
            mapper_info)
        self.commit()

    def mark_inactive(self):
        """Mark form process mapper as inactive."""
        self.status = FormProcessMapperStatus.Inactive
        self.commit()

    @classmethod
    def find_all(cls, page_number, limit):
        """Fetch all active form process mapper."""
        return cls.query.filter(FormProcessMapper.status == FormProcessMapperStatus.Active) \
                        .paginate(page_number, limit, False).items

    @classmethod
    def find_by_id(cls, form_process_mapper_id) -> FormProcessMapper:
        """Find active form process mapper that matches the provided id."""
        return cls.query.filter(and_(FormProcessMapper.id == form_process_mapper_id,
                                     FormProcessMapper.status == FormProcessMapperStatus.Active)).first()

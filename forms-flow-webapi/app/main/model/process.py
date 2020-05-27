from .. import db, flask_bcrypt
from sqlalchemy.dialects import postgresql

class Process(db.Model):
    """ process Model for storing application related process """
    __tablename__ = "FORM_PROCESS_MAPPER"

    mapper_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    form_id = db.Column(db.String(50), nullable=False)
    form_name = db.Column(db.String(100), nullable=False)
    form_revision_number = db.Column(db.String(5), nullable=False)
    process_definition_key = db.Column(db.String(50), nullable=False)
    process_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    comments = db.Column(db.String(300), nullable=True)
    created_by = db.Column(db.String(20), nullable=False)
    created_on = db.Column(db.Date(), nullable=False)
    modified_by = db.Column(db.String(20), nullable=False)
    modified_on = db.Column(db.Date(), nullable=False)
    tenant_id = db.Column(db.String(50), nullable=False)
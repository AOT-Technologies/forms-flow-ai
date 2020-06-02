from .. import db, flask_bcrypt,ma
from sqlalchemy.dialects import postgresql


class FormIOToken(db.Model):
    """ FormIOToken Model for storing formio token """
    __tablename__ = "FAI_FORMIO_TOKEN"

    token_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    keycloak_role = db.Column(db.String(50), nullable=False)
    formio_token = db.Column(db.String(500), nullable=False)
    formio_role = db.Column(db.String(50), nullable=False)
    created_on = db.Column(db.Date(), nullable=False)
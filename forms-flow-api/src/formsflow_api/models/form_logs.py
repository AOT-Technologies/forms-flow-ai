from .base_model import BaseModel
from .db import db
from sqlalchemy.dialects.postgresql import JSON, ARRAY


class FormLogs(BaseModel, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(30), nullable=False)
    logs = db.Column(ARRAY(JSON), nullable=False)

    @classmethod
    def create_form_log(cls, data):
        print(data)
        if data:
            form_log = FormLogs()
            form_log.form_id = data["form_id"]
            form_log.logs = data["logs"]
            return form_log.save()
        else:
            return None

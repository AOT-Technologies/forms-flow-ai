from app.main import db
import json
from sqlalchemy.ext.declarative import DeclarativeMeta
import datetime as datetime

def save_changes(data):
    db.session.add(data)
    db.session.commit()
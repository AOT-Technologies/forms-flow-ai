import uuid
import datetime

from app.main import db
from app.main.model.user import User
from ..common.responses import response


def save_new_user(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        new_user = User(
            public_id=str(uuid.uuid4()),
            email=data['email'],
            username=data['username'],
            password=data['password'],
            registered_on=datetime.datetime.utcnow(),
            admin=False
        )
        save_changes(new_user)
        return response.success_response, response.SUCCESS_CODE
    else:
        return response.fail_object, response.alreadyexisting_code


def get_all_users():
    return User.query.all()


def get_a_user(public_id):
    return User.query.filter_by(public_id=public_id).first()


def save_changes(data):
    db.session.add(data)
    db.session.commit()
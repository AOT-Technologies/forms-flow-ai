from .. import db


def save_changes(data):
    db.session.add(data)
    db.session.commit()

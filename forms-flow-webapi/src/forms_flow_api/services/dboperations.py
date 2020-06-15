"""This manages Base Model functions."""

from ..models import db


@staticmethod
def commit():
    """Commit the session."""
    db.session.commit()


def save_changes(data):
    db.session.add(data)
    db.session.commit()


def delete(self):
    """Delete and commit."""
    db.session.delete(self)
    db.session.commit()


def update_from_dict(self, columns: list, values: dict):
    """Update this model from a given dictionary.
    :params : columns, list of column name to update
    :values : dictionary contains key/value for the columns
    """
    for key in columns:
        exists = key in values
        if exists:
            val = getattr(self, key, '~skip~it~')
            if val != '~skip~it~':
                setattr(self, key, values[key])

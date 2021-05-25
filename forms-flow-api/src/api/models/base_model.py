"""This manages Base Model functions."""

from .db import db


class BaseModel:
    """This class manages all of the base model functions."""

    @staticmethod
    def commit():
        """Commit the session."""
        db.session.commit()

    def save(self):
        """Save and commit."""
        db.session.add(self)
        db.session.commit()
        return self

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
                val = getattr(self, key, "~skip~it~")
                if val != "~skip~it~":
                    setattr(self, key, values[key])

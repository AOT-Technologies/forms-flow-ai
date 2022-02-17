"""This manages Base Model functions."""

from formsflow_api.models.db import db
from typing import Any


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

    def create_filter_condition(
        model: Any, column_name: str, operator: str, value: str
    ):
        """Function to transform column_name, operator and values to filtering condiitons"""
        # get in format model.colum_name
        column = getattr(model, column_name)
        if column:
            try:
                # get filter equivalent comparision operator
                attr = (
                    list(
                        filter(
                            lambda e: hasattr(column, e % operator),
                            ["%s", "%s_", "__%s__"],
                        )
                    )[0]
                    % operator
                )
            except IndexError:
                raise Exception("Invalid filter operator: %s" % operator)
            if value == "null":
                value = None
            if operator == "ilike":
                value = f"%{value}%"
            # Corresponding to model.column_name apply operator with specific value
            filt = getattr(column, attr)(value)
            return filt

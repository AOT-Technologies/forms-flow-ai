"""This manages Base Model functions."""

from typing import Any

from flask import current_app

from formsflow_api.models.db import db


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

    @staticmethod
    def create_filter_condition(  # pylint: disable=inconsistent-return-statements
        model: Any, column_name: str, operator: str, value: str
    ):
        """Function to create_filter_condition.

        To transform column_name, operator and values
        with a filtering conditions used by DB Model.
        """
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
            except IndexError as err:
                current_app.logger.warning(
                    f"Invalid filter operator: {operator}, {err}"
                )
                raise err
            if value == "null":
                value = None
            if operator == "ilike":
                value = f"%{value}%"
            # Corresponding to model.column_name apply operator with specific value
            filt = getattr(column, attr)(value)
            return filt

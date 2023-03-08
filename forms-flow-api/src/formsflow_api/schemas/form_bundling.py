"""This manages form bundling Schema."""

from marshmallow import EXCLUDE, Schema, fields


class SelectedFormSchema(Schema):
    """This class manages form bundling table schema."""

    mapperId = fields.String(required=False)
    path = fields.String(required=False)
    rules = fields.List(fields.String(), required=False)
    formOrder = fields.Integer(required=False)
    parent_form_id = fields.Str(data_key="parentFormId")

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

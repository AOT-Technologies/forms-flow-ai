"""This manages form bundling Schema."""

from marshmallow import EXCLUDE, Schema, fields


class SelectedFormSchema(Schema):
    """This class manages form bundling table schema."""

    mapper_id = fields.String(data_key="mapperId", required=False)
    path = fields.String(data_key="path", required=False)
    rules = fields.List(fields.String(), required=False)
    form_order = fields.Integer(data_key="formOrder", required=False)
    parent_formId = fields.Str(data_key="parentFormId")

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

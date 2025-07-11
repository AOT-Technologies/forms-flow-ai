"""This manages schema for User filter preference for Analyze submissions."""

from marshmallow import EXCLUDE, Schema, fields


class SubmissionsFilterSchema(Schema):
    """This class manages user-specific preferences for filters in analyze submissions."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    tenant = fields.Str(allow_none=True, dump_only=True)
    user = fields.Str(allow_none=True, dump_only=True)
    parent_form_id = fields.Str(required=True, data_key="parentFormId")
    variables = fields.List(fields.Dict(), required=True)

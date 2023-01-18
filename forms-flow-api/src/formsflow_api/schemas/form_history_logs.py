"""This manages Form history Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FormHistorySchema(Schema):
    """This class provides the schema for Form history."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    form_id = fields.Str(data_key="formId")
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str(data_key="created")
    change_log = fields.Dict(data_key="changeLog")

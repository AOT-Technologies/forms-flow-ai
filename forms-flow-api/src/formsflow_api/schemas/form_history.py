"""This manages Form history Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FormHistorySchema(Schema):
    """This class provides the schema for Form history."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    parent_form_id = fields.Str(data_key="parentFormId")
    cloned_form_id = fields.Str(data_key="clonedFormId")
    created_by = fields.Str(data_key="createdBy", dump_only=True)
    created = fields.Str(data_key="created", dump_only=True)

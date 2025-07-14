"""This manages Filter preference Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FilterPreferenceSchema(Schema):
    """This class provides the schema for filter preference."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    tenant = fields.Str(dump_only=True)
    user_id = fields.Str(data_key="userId", dump_only=True)
    filter_id = fields.Int(data_key="filterId")
    sort_order = fields.Int(data_key="sortOrder")
    hide = fields.Bool(data_key="hide")

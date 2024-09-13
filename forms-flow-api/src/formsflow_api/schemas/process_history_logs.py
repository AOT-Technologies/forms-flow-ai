"""This manages Process history Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ProcessHistorySchema(Schema):
    """This class provides the schema for Form history."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    name = fields.Str(data_key="processName")
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str(data_key="created")
    major_version = fields.Int(data_key="majorVersion")
    minor_version = fields.Int(data_key="minorVersion")

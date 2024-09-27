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
    process_type = fields.Method("get_process_type", data_key="processType")
    isMajor = fields.Method("get_is_major", dump_only=True)

    def get_is_major(self, obj):
        """Determine if the version is major."""
        return obj.minor_version == 0

    def get_process_type(self, obj):
        """This method is to get the process type."""
        return obj.process_type.value

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
    major_version = fields.Int(data_key="majorVersion")
    minor_version = fields.Int(data_key="minorVersion")
    version = fields.Method("get_combined_version", dump_only=True)
    isMajor = fields.Method("get_is_major", dump_only=True)

    def get_combined_version(self, obj):
        """Combine major and minor versions."""
        major_version = obj.major_version or 1
        minor_version = obj.minor_version or 0
        return f"{major_version}.{minor_version}"

    def get_is_major(self, obj):
        """Determine if the version is major."""
        return obj.minor_version == 0


class FormHistoryReqSchema(Schema):
    """This is a general class for paginated request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    page_no = fields.Int(data_key="pageNo", required=False, allow_none=True)
    limit = fields.Int(required=False, allow_none=True)

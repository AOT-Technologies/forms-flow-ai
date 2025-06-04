"""This manages Filter Schema."""

from marshmallow import EXCLUDE, Schema, fields

from .base_schema import AuditDateTimeSchema


class VariableSchema(Schema):
    """This class provides the schema for variable."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    name = fields.Str(required=True)
    label = fields.Str()


class FilterSchema(AuditDateTimeSchema):
    """This class manages Filter schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    tenant = fields.Str(allow_none=True)
    name = fields.Str()
    criteria = fields.Dict()
    variables = fields.List(
        fields.Dict()
    )  # Add fields.Nested(VariableSchema) when fields for Variable schema is fixed
    properties = fields.Dict()
    roles = fields.List(fields.Str())
    users = fields.List(fields.Str())
    status = fields.Str()
    created_by = fields.Str(data_key="createdBy", dump_only=True)
    modified_by = fields.Str(data_key="modifiedBy", dump_only=True)
    isMyTasksEnabled = fields.Bool(load_only=True)
    isTasksForCurrentUserGroupsEnabled = fields.Bool(load_only=True)
    sort_order = fields.Int(data_key="sortOrder", allow_none=True, dump_only=True)
    hide = fields.Bool(data_key="hide", default=False, allow_none=True, dump_only=True)
    filter_type = fields.Method(
        "get_filter_type",
        deserialize="load_filter_type",
        data_key="filterType",
        allow_none=True,
    )
    parent_filter_id = fields.Int(data_key="parentFilterId", allow_none=True)

    def get_filter_type(self, obj):
        """This method is to get the filter type."""
        return obj.filter_type.value

    def load_filter_type(self, value):
        """This method is to load the filter type."""
        return value.upper() if value else None

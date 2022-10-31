"""This manages Filter Schema."""

from marshmallow import EXCLUDE, Schema, fields


class VariableSchema(Schema):
    """This class provides the schema for variable."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    name = fields.Str(required=True)
    label = fields.Str()


class FilterSchema(Schema):
    """This class manages Filter schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    tenant = fields.Str()
    name = fields.Str()
    description = fields.Str()
    resource_id = fields.Str(data_key="resourceId")
    criteria = fields.Dict()
    variables = fields.List(fields.Nested(VariableSchema))
    properties = fields.Dict()
    roles = fields.List(fields.Str())
    users = fields.List(fields.Str())
    status = fields.Str()
    created = fields.Str(dump_only=True)
    modified = fields.Str(dump_only=True)
    created_by = fields.Str(data_key="createdBy", dump_only=True)
    modified_by = fields.Str(data_key="modifiedBy", dump_only=True)

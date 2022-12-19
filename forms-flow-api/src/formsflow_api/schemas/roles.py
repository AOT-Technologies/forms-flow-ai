"""This manages keycloak roles/groups schema."""

from marshmallow import EXCLUDE, Schema, fields


class RolesGroupsSchema(Schema):
    """This is a general class for keycloak roles/groups schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()

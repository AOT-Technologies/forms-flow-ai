"""This is for marshmallowing Keycloak groups field."""
from marshmallow import EXCLUDE, Schema, fields


class KeycloakDashboardGroupSchema(Schema):
    """This class manages Keycloak Group Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta class."""

        unknown = EXCLUDE

    dashboards = fields.List(
        fields.Dict(keys=fields.Str(), values=fields.Str(), required=True)
    )

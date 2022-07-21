"""This is for marshmallowing Formio role ids."""
from marshmallow import EXCLUDE, Schema, fields


class FormioRoleSchema(Schema):
    """This class manages the Formio role id request response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    roleId = fields.Str(data_key="_id", required=True)
    type = fields.Str(data_key="machineName", required=True)

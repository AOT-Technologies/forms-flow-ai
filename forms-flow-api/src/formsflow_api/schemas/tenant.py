"""This manages tenant Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class TenantSchema(Schema):
    """This class manages tenant response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    tenant_name = fields.Str(data_key="tenantName")
    relam = fields.Str()
    audience = fields.Str()

# """This manages process Response Schema."""
"""Process schema."""
from marshmallow import EXCLUDE, Schema, fields


class ProcessListSchema(Schema):
    """This class manages processlist response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    key = fields.Str()
    name = fields.Str()
    tenantId = fields.Str(data_key="tenantKey")

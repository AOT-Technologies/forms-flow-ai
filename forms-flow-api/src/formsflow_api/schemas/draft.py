from marshmallow import EXCLUDE, Schema, fields


class DraftSchema(Schema):
    """This class manages submission request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    _id = fields.Str(data_key="_id")
    application_id = fields.Int(data_key="applicationId")
    data = fields.Dict(data_key="data", required=True)
    created = fields.Str()
    modified = fields.Str()

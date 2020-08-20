"""This manages application Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ApplicationAuditReqSchema(Schema):
    """This class manages application list request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Str()


class ApplicationAuditSchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Int(data_key='applicationId')
    application_name = fields.Str(data_key='applicationName')
    application_status = fields.Str(data_key='applicationStatus')
    count = fields.Int()

"""This manages Form request and response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FormLogsRequestSchema(Schema):
    """This class manages Form log request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    formId = fields.Str(data_key="formId",load_only=True)
    mapper_version = fields.Int(data_key="mapperVersion", load_only=True)
    form_revision = fields.Str(data_key="formRevision")
    status = fields.Str(data_key="status", load_only=True)
    processName= fields.Str(data_key="processName", load_only=True)

    # count = fields.Int()

class FormLogsResponseSchema(Schema):
    """This class manges form log response schema"""
    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    
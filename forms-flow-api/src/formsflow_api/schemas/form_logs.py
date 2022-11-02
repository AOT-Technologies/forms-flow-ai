"""This manages form logs  Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FormVariableSchema(Schema):
    """THIS IS VARIABLE SCHEMA FOR FORM LOGS."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exlude."""

        unkown: EXCLUDE

    mapper_version = fields.Str(data_key="mapperVersion", required=True)
    form_revision = fields.Str(
        data_key="formRevision",
        required=True,
    )
    form_name = fields.Str(data_key="formName", required=True)
    process_name = fields.Str(data_key="processName", required=True)
    mofied_by = fields.Str(data_key="modifedBy", required=False, dump_only=True)


class FormLogsRequestSchema(FormVariableSchema):
    """THIS IS FOR REQUEST SCHEMA."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exlude."""

        unkown: EXCLUDE

    form_id = fields.Str(data_key="formId", required=False)


class FormLogsResponseSchema(Schema):
    """THIS IS RESPONSE SCHEMA FOR FORM LOGS."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exlude."""

        unknown = EXCLUDE

    form_id = fields.Str(data_key="formId")
    id = fields.Int(data_key="id")
    logs = fields.List(fields.Nested(FormVariableSchema))

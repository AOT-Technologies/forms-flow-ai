"""This manages application Response Schema."""

from marshmallow import EXCLUDE, fields

from .base_schema import AuditDateTimeSchema


class ApplicationHistorySchema(AuditDateTimeSchema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(load_only=True)
    application_id = fields.Int(data_key="applicationId", load_only=True)
    application_status = fields.Str(data_key="applicationStatus")
    form_url = fields.Str(data_key="formUrl", load_only=True)
    submitted_by = fields.Str(data_key="submittedBy", required=False, allow_none=True)
    form_id = fields.Str(data_key="formId", dump_only=True)
    submission_id = fields.Str(data_key="submissionId", dump_only=True)
    color = fields.Str(allow_none=True)
    percentage = fields.Float(allow_none=True)

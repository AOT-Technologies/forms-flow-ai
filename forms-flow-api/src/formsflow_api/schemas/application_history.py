"""This manages application Response Schema."""

from marshmallow import EXCLUDE, Schema, fields

# class ApplicationHistoryReqSchema(Schema):
#     """This class manages application list request schema."""

#     class Meta:  # pylint: disable=too-few-public-methods
#         """Exclude unknown fields in the deserialized output."""

#         unknown = EXCLUDE

#     application_id = fields.Str()


class ApplicationHistorySchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(load_only=True)
    application_id = fields.Int(data_key="applicationId", load_only=True)
    application_status = fields.Str(data_key="applicationStatus")
    form_url = fields.Str(data_key="formUrl", load_only=True)
    created = fields.Str()
    submitted_by = fields.Str(data_key="submittedBy", required=False, allow_none=True)
    form_id = fields.Str(data_key="formId", dump_only=True)
    submission_id = fields.Str(data_key="submissionId", dump_only=True)
    # count = fields.Int()

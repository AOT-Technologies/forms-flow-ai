"""This manages form process mapper Schema."""

from marshmallow import EXCLUDE, Schema, fields


class FormProcessMapperSchema(Schema):
    """This class manages form process mapper request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str(data_key="id")
    form_id = fields.Str(data_key="formId", required=True)
    form_name = fields.Str(data_key="formName", required=True)
    form_revision_number = fields.Str(data_key="formRevisionNumber", required=True)
    process_key = fields.Str(data_key="processKey")
    process_name = fields.Str(data_key="processName")
    comments = fields.Str(data_key="comments")

    status = fields.Str(data_key="status")  # active/inactive
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str(data_key="created")
    modified_by = fields.Str(data_key="modifiedBy")
    modified = fields.Str(data_key="modified")

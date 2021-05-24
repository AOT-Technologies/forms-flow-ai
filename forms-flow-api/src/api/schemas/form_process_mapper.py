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
    comments = fields.Str()

    status = fields.Str()  # active/inactive
    created_by = fields.Str()
    created = fields.Str()
    modified_by = fields.Str()
    modified = fields.Str()

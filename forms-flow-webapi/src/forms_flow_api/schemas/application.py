"""This manages application Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ApplicationListReqSchema(Schema):
    """This class manages applicationlist request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    page_no = fields.Int(data_key='pageNo', required=False, allow_none=True)
    limit = fields.Int(required=False, allow_none=True)


class ApplicationSchema(Schema):
    """This class manages application request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    mapper_id = fields.Str(data_key='id')

    form_id = fields.Str(data_key='formId', required=True)
    form_name = fields.Str(data_key='name', required=True)
    form_revision_number = fields.Str(data_key='formRevisionNumber', required=True)
    process_definition_key = fields.Str(data_key='processDefinitionKey', required=True)
    process_name = fields.Str(data_key='processName', required=True)
    comments = fields.Str(required=True)

    status = fields.Str()
    created_by = fields.Str()
    created_on = fields.Str()
    modified_by = fields.Str()
    modified_on = fields.Str(data_key='updatedOn')

    tenant_id = fields.Str(data_key='tenantId', required=True)

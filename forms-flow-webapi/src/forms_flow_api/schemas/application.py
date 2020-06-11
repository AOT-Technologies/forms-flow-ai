"""This manages application Response Schema."""

from marshmallow import EXCLUDE, Schema, fields



class ApplicationListReqSchema(Schema):
    """This class manages applicationlist request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    pageNo = fields.Int(data_key='pageNo', required=False, allow_none=True)
    limit = fields.Int(data_key='limit', required=False, allow_none=True)

class ApplicationReqSchema(Schema):
    """This class manages application request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_id = fields.Str(required=True)
    form_name = fields.Str(required=True)
    form_revision_number = fields.Str(required=True)
    process_definition_key = fields.Str(required=True)
    process_name = fields.Str(required=True)
    comments = fields.Str(required=True)
    tenant_id = fields.Str(required=True)

class ApplicationSchema(Schema):
    """This class manages application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    mapper_id = fields.Str(data_key='id')
    form_id = fields.Str()
    form_name = fields.Str(data_key='name')
    form_revision_number = fields.Str()
    process_definition_key = fields.Str()
    process_name = fields.Str()
    status = fields.Str()
    comments = fields.Str()
    created_by = fields.Str()
    created_on = fields.Str()
    modified_by = fields.Str()
    modified_on = fields.Str(data_key='updated_on')
    tenant_id = fields.Str()

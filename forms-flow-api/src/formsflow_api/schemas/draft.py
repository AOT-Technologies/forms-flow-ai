"""This manages draft Response Schema."""
from marshmallow import EXCLUDE, Schema, fields


class DraftSchema(Schema):
    """This class manages submission request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    _id = fields.Str(data_key="_id")
    id = fields.Int(data_key="id")
    application_id = fields.Int(data_key="applicationId")
    data = fields.Dict(data_key="data", required=True)
    created = fields.Str()
    modified = fields.Str()
    form_name = fields.Str(data_key="DraftName", dump_only=True)
    form_id = fields.Str(data_key="formId", dump_only=True)
    created_by = fields.Str(data_key="CreatedBy", dump_only=True)
    process_key = fields.Str(data_key="processKey", dump_only=True)
    process_name = fields.Str(data_key="processName", dump_only=True)


class DraftListSchema(Schema):
    """This class manages the draft listing schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(data_key="id")
    form_name = fields.Str(data_key="DraftName")
    modified = fields.Str()
    page_no = fields.Int(data_key="pageNo", required=False, allow_none=True)
    limit = fields.Int(required=False, allow_none=True)
    modified_from_date = fields.DateTime(
        data_key="modifiedFrom", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    modified_to_date = fields.DateTime(
        data_key="modifiedTo", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    sort_order = fields.Str(data_key="sortOrder", required=False)
    order_by = fields.Str(data_key="sortBy", required=False)

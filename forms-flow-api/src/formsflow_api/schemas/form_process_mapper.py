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
    process_key = fields.Str(data_key="processKey")
    process_name = fields.Str(data_key="processName")
    comments = fields.Str(data_key="comments")
    is_anonymous = fields.Bool(data_key="anonymous")
    status = fields.Str(data_key="status")  # active/inactive
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str(data_key="created")
    modified_by = fields.Str(data_key="modifiedBy")
    modified = fields.Str(data_key="modified")


class FormProcessMapperSortingSchema(Schema):

    """This class manages formprocessmapper list request schema."""

    sort_by = fields.Str(data_key="sortBy", required=False)
    sort_order = fields.Str(data_key="sortOrder", required=False)


class FormProcessMapperPaginationSchema(Schema):
    """This is a general class for paginated request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    page_no = fields.Int(data_key="pageNo", required=False, allow_none=True)
    limit = fields.Int(data_key="limit", required=False, allow_none=True)
    sorting = fields.Nested(
        FormProcessMapperSortingSchema, required=False, allow_none=True
    )


class FormProcessMapperSearchSchema(Schema):
    """This is a general class for paginated request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_name = fields.Str(data_key="formName", required=False, allow_none=True)
    pagination = fields.Nested(
        FormProcessMapperPaginationSchema, required=False, allow_none=True
    )

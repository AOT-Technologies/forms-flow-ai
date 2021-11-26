"""This manages application Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ApplicationListReqSchema(Schema):
    """This is a general class for paginated request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    page_no = fields.Int(data_key="pageNo", required=False, allow_none=True)
    limit = fields.Int(required=False, allow_none=True)


class ApplicationListRequestSchema(ApplicationListReqSchema):

    """This class manages application list request schema."""

    order_by = fields.Str(data_key="sortBy", required=False)
    application_id = fields.Int(data_key="Id", required=False)
    application_name = fields.Str(data_key="applicationName", required=False)
    application_status = fields.Str(data_key="applicationStatus", required=False)
    created_by = fields.Str(data_key="createdBy", required=False)
    created = fields.Str(data_key="created", required=False)
    modified = fields.Str(data_key="modified", required=False)
    sort_order = fields.Str(data_key="sortOrder", required=False)


class ApplicationStatusSchema(Schema):
    """This class manages application status schema"""
    class Meta:
        unknown = EXCLUDE

    application_status = fields.Str()


class ApplicationSchema(Schema):
    """This class manages application request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(data_key="id")
    application_name = fields.Str(data_key="applicationName")
    application_status = fields.Str(data_key="applicationStatus")
    form_process_mapper_id = fields.Str(data_key="formProcessMapperId")
    form_url = fields.Str(data_key="formUrl")
    process_instance_id = fields.Str(data_key="processInstanceId")
    revision_no = fields.Str(data_key="revisionNo")

    created_by = fields.Str(data_key="createdBy")
    created = fields.Str()
    modified_by = fields.Str(data_key="modifiedBy")
    modified = fields.Str()

    variables = fields.Raw(required=False)
    form_id = fields.Str(data_key="formId")
    submission_id = fields.Str(data_key="submissionId")


class ApplicationUpdateSchema(Schema):
    """This class manages application update request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_status = fields.Str(data_key="applicationStatus", required=True)
    form_url = fields.Str(data_key="formUrl", required=False)

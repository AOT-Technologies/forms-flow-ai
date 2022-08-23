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
    created_from_date = fields.DateTime(
        data_key="createdFrom", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    created_to_date = fields.DateTime(
        data_key="createdTo", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    modified_from_date = fields.DateTime(
        data_key="modifiedFrom", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    modified_to_date = fields.DateTime(
        data_key="modifiedTo", format="%Y-%m-%dT%H:%M:%S+00:00"
    )
    sort_order = fields.Str(data_key="sortOrder", required=False)


class ApplicationSchema(Schema):
    """This class manages application request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(data_key="id")
    application_name = fields.Str(data_key="applicationName")
    application_status = fields.Str(data_key="applicationStatus")
    form_process_mapper_id = fields.Str(data_key="formProcessMapperId")
    process_instance_id = fields.Str(data_key="processInstanceId")
    process_key = fields.Str(data_key="processKey")
    process_name = fields.Str(data_key="processName")
    process_tenant = fields.Str(data_key="processTenant")
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str()
    modified_by = fields.Str(data_key="modifiedBy")
    modified = fields.Str()
    form_id = fields.Str(data_key="formId", load_only=True)
    latest_form_id = fields.Str(data_key="formId", dump_only=True)
    submission_id = fields.Str(data_key="submissionId")
    form_url = fields.Str(data_key="formUrl", load_only=True)
    web_form_url = fields.Str(data_key="webFormUrl", load_only=True)


class ApplicationUpdateSchema(Schema):
    """This class manages application update request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_status = fields.Str(data_key="applicationStatus", required=True)
    form_url = fields.Str(data_key="formUrl", required=False)


class ApplicationSubmissionSchema(Schema):
    """This class provides the schema for application submission data."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_url = fields.Str(data_key="formUrl", required=True)
    submission_id = fields.Str(data_key="submissionId", required=True)
    web_form_url = fields.Str(data_key="webFormUrl", load_only=True)

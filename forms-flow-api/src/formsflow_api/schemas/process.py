"""This manages process data Schema."""

import json

from formsflow_api_utils.exceptions import BusinessException
from marshmallow import EXCLUDE, Schema, fields, validates

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import FormProcessMapper


class ProcessListSchema(Schema):
    """This class manages processlist response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    key = fields.Str()
    name = fields.Str()
    tenantId = fields.Str(data_key="tenantKey")


class ProcessDataSchema(Schema):
    """This class manages process data schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    name = fields.Str()
    process_data = fields.Method(
        "get_process_data", data_key="processData", dump_only=True
    )
    tenant = fields.Str(dump_only=True)
    created = fields.Str(dump_only=True)
    modified = fields.Str(dump_only=True)
    created_by = fields.Str(data_key="createdBy", dump_only=True)
    modified_by = fields.Str(data_key="modifiedBy", dump_only=True)
    status = fields.Method("get_status", deserialize="load_status")
    process_type = fields.Method(
        "get_process_type", deserialize="load_process_type", data_key="processType"
    )
    is_subflow = fields.Bool(data_key="isSubflow")
    process_key = fields.Str(data_key="processKey")
    parent_process_key = fields.Str(data_key="parentProcessKey")

    def get_status(self, obj):
        """This method is to get the status."""
        return obj.status.value

    def load_status(self, value):
        """This method is to load the status."""
        return value.upper() if value else None

    def get_process_type(self, obj):
        """This method is to get the process type."""
        return obj.process_type.value

    def load_process_type(self, value):  # check & delete this if not needed
        """This method is to load the process type."""
        return value.upper() if value else None

    def get_process_data(self, obj):
        """This method is to get the process data."""
        obj.process_data = obj.process_data.decode("utf-8")
        if obj.process_type.value == "LOWCODE":
            return json.loads(obj.process_data)
        return obj.process_data

    @validates("form_process_mapper_id")
    def validate_form_process_mapper_id(self, data):
        """This method is to validate the form process mapper id."""
        if not FormProcessMapper.find_form_by_id(data):
            raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)


class ProcessListRequestSchema(Schema):
    """This class manages Process list request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    page_no = fields.Int(data_key="pageNo", allow_none=True)
    limit = fields.Int(required=False, allow_none=True)
    sort_by = fields.Str(data_key="sortBy", required=False)
    process_id = fields.Int(data_key="id", required=False)
    name = fields.Str(required=False)
    status = fields.Str(required=False)
    process_data_type = fields.Str(required=False, data_key="processType")
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
    major_version = fields.Int(data_key="majorVersion")
    minor_version = fields.Int(data_key="minorVersion")


class ProcessRequestSchema(Schema):
    """This class manages process request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    process_type = fields.Str(data_key="processType", required=True)
    process_data = fields.Str(data_key="processData", required=True)

    def load(self, data, *args, **kwargs):
        """Load method for deserializing data."""
        process_type = data.get("processType")
        process_data = data.get("processData")
        # For "LOWCODE" process type, convert JSON string input of processData to string before loading.
        if process_type and process_type.upper() == "LOWCODE" and process_data:
            data["processData"] = json.dumps(process_data)
        return super().load(data, *args, **kwargs)


class MigrateRequestSchema(Schema):
    """This class manages migrate request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    process_key = fields.Str(data_key="processKey", required=True)
    mapper_id = fields.Str(data_key="mapperId", required=True)

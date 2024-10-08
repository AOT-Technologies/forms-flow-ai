"""This exposes process service."""

import json
import xml.etree.ElementTree as ET

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context
from lxml import etree

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Process
from formsflow_api.schemas import (
    ProcessDataSchema,
    ProcessHistorySchema,
    ProcessListRequestSchema,
)

processSchema = ProcessDataSchema()


class ProcessService:  # pylint: disable=too-few-public-methods
    """This class manages process service."""

    @classmethod
    def _xml_parser(cls, process_data):
        """Parse the process data."""
        return ET.fromstring(process_data.encode("utf-8"))

    @classmethod
    def get_all_process(cls, request_args):  # pylint:disable=too-many-locals
        """Get all process list."""
        dict_data = ProcessListRequestSchema().load(request_args) or {}
        page_no = dict_data.get("page_no")
        limit = dict_data.get("limit")
        sort_by = dict_data.get("sort_by", "id")
        process_id = dict_data.get("process_id")
        process_name = dict_data.get("name")
        status = dict_data.get("status").upper() if dict_data.get("status") else None
        process_type = (
            dict_data.get("process_data_type").upper()
            if dict_data.get("process_data_type")
            else None
        )
        created_by = dict_data.get("created_by")
        created_from_date = dict_data.get("created_from_date")
        created_to_date = dict_data.get("created_to_date")
        modified_from_date = dict_data.get("modified_from_date")
        modified_to_date = dict_data.get("modified_to_date")
        sort_order = dict_data.get("sort_order", "desc")
        process, count = Process.find_all_process(
            created_from=created_from_date,
            created_to=created_to_date,
            modified_from=modified_from_date,
            modified_to=modified_to_date,
            sort_by=sort_by,
            sort_order=sort_order,
            created_by=created_by,
            id=process_id,
            process_name=process_name,
            process_status=status,
            process_type=process_type,
            page_no=page_no,
            limit=limit,
        )
        return processSchema.dump(process, many=True), count

    @classmethod
    def _upate_process_name_and_id(cls, xml_data, process_name):
        """Parse the workflow XML data & update process name."""
        current_app.logger.info("Updating workflow...")
        # pylint: disable=I1101
        root = cls._xml_parser(xml_data)

        # Find the bpmn:process element
        process = root.find(".//{http://www.omg.org/spec/BPMN/20100524/MODEL}process")
        if process is not None:
            process.set("id", process_name)
            process.set("name", process_name)

        # Convert the XML tree back to a string
        updated_xml = etree.tostring(
            root, pretty_print=True, encoding="unicode", xml_declaration=False
        )
        # Prepend the XML declaration
        updated_xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + updated_xml
        return updated_xml

    @classmethod
    @user_context
    def create_process(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls,
        process_data=None,
        process_type=None,
        process_name=None,
        process_key=None,
        is_subflow=False,
        **kwargs,
    ):
        """Save process data."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        current_app.logger.debug("Save process data..")

        if process_data is None or process_type is None:
            raise BusinessException(BusinessErrorCode.INVALID_PROCESS_DATA)

        # Process the data name and key based on the process type and subflow status
        process_data, process_name, process_key = cls._process_data_name_and_key(
            process_data=process_data,
            process_type=process_type,
            is_subflow=is_subflow,
            process_name=process_name,
            process_key=process_key,
        )

        # Check if the process already exists if it is a subflow
        if is_subflow:
            if Process.find_process_by_name_key(
                name=process_name, process_key=process_key
            ):
                raise BusinessException(BusinessErrorCode.PROCESS_EXISTS)

        # Initialize version numbers for the new process
        major_version, minor_version = 1, 0

        # Create a new process instance
        process = Process(
            name=process_name,
            process_type=process_type.upper(),
            tenant=tenant_key,
            process_data=process_data,
            created_by=user.user_name,
            major_version=major_version,
            minor_version=minor_version,
            is_subflow=is_subflow,
            process_key=process_key,
            parent_process_key=process_key,
        )

        # Save the new process to the database
        process.save()

        # Return the serialized process data
        return processSchema.dump(process)

    @classmethod
    def _process_data_name_and_key(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls,
        process_data=None,
        process_type=None,
        is_subflow=False,
        process_name=None,
        process_key=None,
    ):
        """Process data name key."""
        # if the process is not a subflow, update the process name and ID in the XML data
        # if the process is a subflow, parse the XML data to extract the process name and key
        # if the process is of type LOWCODE, convert the process data to JSON format
        if is_subflow:
            # Parse the XML data to extract process name and key for subflows
            parsed_data = cls._xml_parser(process_data)
            process_data = process_data.encode("utf-8")
            process_name, process_key = parsed_data.get("name"), parsed_data.get("id")
        else:
            if process_type.upper() == "LOWCODE":
                # Convert process data to JSON format for LOWCODE type processes
                process_data = json.dumps(process_data)
            else:
                # Update the process name and ID in the XML data for other process types
                process_data = cls._upate_process_name_and_id(
                    process_data, process_name
                )
        return process_data, process_name, process_key

    @classmethod
    def get_process_by_key(cls, process_key):
        """Get process by key."""
        current_app.logger.debug(f"Get process data for process key: {process_key}")
        process = Process.get_latest_version_by_key(process_key)
        if process:
            return processSchema.dump(process)
        raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

    @classmethod
    @user_context
    def update_process(cls, process_id, process_data, process_type, **kwargs):
        """Update process data."""
        current_app.logger.debug(f"Update process data for process id: {process_id}")
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        process = Process.find_process_by_id(process_id)

        if process is None:
            raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

        # Process the data name and key based on the process type and subflow status
        process_data, process_name, process_key = cls._process_data_name_and_key(
            process_data=process_data,
            process_type=process_type or process.process_type,
            is_subflow=process.is_subflow,
            process_name=process.name,
            process_key=process.process_key,
        )

        # Check if the process name or key already exists if it is a subflow
        if process.is_subflow and Process.find_process_by_name_key(
            name=process_name,
            process_key=process_key,
            parent_process_key=process.parent_process_key,
        ):
            raise BusinessException(BusinessErrorCode.PROCESS_EXISTS)

        # Determine version numbers based on the process status
        is_unpublished = process.status == "Draft" and process.status_changed
        major_version = (
            process.major_version + 1 if is_unpublished else process.major_version
        )
        minor_version = 0 if is_unpublished else process.minor_version + 1

        # Create a new process instance with updated data
        process = Process(
            name=process_name,
            process_type=process_type.upper(),
            tenant=tenant_key,
            process_data=process_data,
            created_by=user.user_name,
            major_version=major_version,
            minor_version=minor_version,
            is_subflow=process.is_subflow,
            process_key=process_key,
            parent_process_key=process.parent_process_key,
        )

        # Save the updated process to the database
        process.save()

        # Return the serialized process data
        return processSchema.dump(process)

    @classmethod
    def delete_process(cls, process_id):
        """Delete process."""
        current_app.logger.debug(f"Delete process data for process id: {process_id}")
        process = Process.find_process_by_id(process_id)
        if process:
            process.delete()
            return {"message": "Process deleted."}
        raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

    @staticmethod
    def get_all_history(parent_process_key: str, request_args):
        """Get all history."""
        assert parent_process_key is not None
        dict_data = ProcessListRequestSchema().load(request_args) or {}
        page_no = dict_data.get("page_no")
        limit = dict_data.get("limit")
        process_histories, count = Process.fetch_histories_by_parent_process_key(
            parent_process_key, page_no, limit
        )
        if process_histories:
            process_history_schema = ProcessHistorySchema(many=True)
            return process_history_schema.dump(process_histories), count
        raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

    @staticmethod
    def validate_process(request):
        """Validate process name/key."""
        process_key = request.args.get("processKey")
        process_name = request.args.get("processName")
        parent_process_key = request.args.get("parentProcessKey")

        if not (process_key or process_name):
            raise BusinessException(BusinessErrorCode.INVALID_PROCESS_VALIDATION_INPUT)

        validation_response = Process.find_process_by_name_key(
            process_name, process_key, parent_process_key
        )

        if validation_response:
            raise BusinessException(BusinessErrorCode.PROCESS_EXISTS)
        # If no results, the process name/key is valid
        return {}

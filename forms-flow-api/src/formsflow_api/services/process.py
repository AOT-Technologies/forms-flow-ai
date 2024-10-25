"""This exposes process service."""

import json

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context
from lxml import etree

from formsflow_api.constants import BusinessErrorCode, default_flow_xml_data
from formsflow_api.models import Process, ProcessStatus, ProcessType
from formsflow_api.schemas import (
    ProcessDataSchema,
    ProcessHistorySchema,
    ProcessListRequestSchema,
)
from formsflow_api.services.external.bpm import BPMService

processSchema = ProcessDataSchema()


class ProcessService:  # pylint: disable=too-few-public-methods
    """This class manages process service."""

    @classmethod
    def xml_parser(cls, process_data):
        """Parse the process data."""
        # pylint: disable=I1101
        parser = etree.XMLParser(resolve_entities=False)
        return etree.fromstring(process_data.encode("utf-8"), parser=parser)

    @classmethod
    def get_all_process(cls, request_args):  # pylint:disable=too-many-locals
        """Get all process list."""
        dict_data = ProcessListRequestSchema().load(request_args) or {}
        page_no = dict_data.get("page_no")
        limit = dict_data.get("limit")
        sort_by = dict_data.get("sort_by", "")
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
        sort_order = dict_data.get("sort_order", "")
        sort_by = sort_by.split(",")
        sort_order = sort_order.split(",")
        process, count = Process.find_all_process(
            created_from=created_from_date,
            created_to=created_to_date,
            modified_from=modified_from_date,
            modified_to=modified_to_date,
            sort_by=sort_by,
            is_subflow=True,  # now only for subflow listing
            sort_order=sort_order,
            created_by=created_by,
            id=process_id,
            process_name=process_name,
            process_status=status,
            process_type=process_type,
            page_no=page_no,
            limit=limit,
        )
        return (
            ProcessDataSchema(exclude=["process_data"]).dump(process, many=True),
            count,
        )

    @classmethod
    def _upate_process_name_and_id(
        cls, xml_data, process_name, process_key, process_type
    ):
        """Parse the workflow XML data & update process name."""
        current_app.logger.info("Updating workflow...")
        # pylint: disable=I1101
        root = cls.xml_parser(xml_data)

        # Find the bpmn:process element
        process = cls.get_process_by_type(root, process_type)

        if process is not None:
            process.set("id", process_name)
            process.set("name", process_key or process_name)

        # Convert the XML tree back to a string
        updated_xml = etree.tostring(
            root, pretty_print=True, encoding="unicode", xml_declaration=False
        )

        # Prepend the XML declaration
        updated_xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + updated_xml
        return updated_xml.encode("utf-8")

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
        process_dict = {
            "name": process_name,
            "process_type": process_type.upper(),
            "tenant": tenant_key,
            "process_data": process_data,
            "created_by": user.user_name,
            "major_version": major_version,
            "minor_version": minor_version,
            "is_subflow": is_subflow,
            "process_key": process_key,
            "parent_process_key": process_key,
        }
        process = Process.create_from_dict(process_dict)

        # Return the serialized process data
        return processSchema.dump(process)

    @staticmethod
    def get_process_by_type(root, process_type):
        """Get process name and id by type (BPMN or DMN)."""
        # Define namespaces for BPMN and DMN
        process_type = process_type.lower()
        namespaces = {
            "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "dmn": "https://www.omg.org/spec/DMN/20191111/MODEL/",
        }

        # Check if the provided type exists in the namespace dictionary
        if process_type not in namespaces:
            raise ValueError(f"Unsupported process type: {process_type}")

        # Use the appropriate namespace for the type
        target = (
            f"{process_type}:decision"
            if process_type == "dmn"
            else f"{process_type}:process"
        )
        process = root.find(target, namespaces)

        # Check if process is found
        if process is None:
            raise ValueError(f"No process found for the given type: {process_type}")

        return process

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
        if is_subflow and process_type.upper() != "LOWCODE":
            # Parse the XML data to extract process name and key for subflows
            root = cls.xml_parser(process_data)
            process = cls.get_process_by_type(root, process_type)
            process_key = process.get("id")
            process_name = process.get("name")
            process_data = process_data.encode("utf-8")
        else:
            if process_type.upper() == "LOWCODE":
                # Convert process data to JSON format for LOWCODE type processes
                process_data = json.dumps(process_data)
            else:
                # Update the process name and ID in the XML data for other process types
                process_data = cls._upate_process_name_and_id(
                    xml_data=process_data,
                    process_name=process_name,
                    process_key=process_key,
                    process_type=process_type,
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
    def validate_process_by_id(cls, process_id):
        """Validate process by id."""
        process = Process.find_process_by_id(process_id)
        # If process not available or if publish/unpublish non subflow
        if not process or (process and process.is_subflow is False):
            raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)
        return process

    @classmethod
    def determine_process_version(
        cls, status, status_changed, major_version, minor_version
    ):
        """Determine process version."""
        current_app.logger.debug("Identifying process version..")
        is_unpublished = status == ProcessStatus.DRAFT and status_changed
        major_version = major_version + 1 if is_unpublished else major_version
        minor_version = 0 if is_unpublished else minor_version + 1
        return major_version, minor_version

    @classmethod
    @user_context
    def update_process(cls, process_id, process_data, process_type, **kwargs):
        """Update process data."""
        current_app.logger.debug(f"Update process data for process id: {process_id}")
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        # Find the process by its ID
        process = Process.find_process_by_id(process_id)
        if process is None:
            # Raise an exception if the process is not found
            raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

        # Get the latest version of the process by its parent key
        latest_process = Process.get_latest_version_by_parent_key(
            process.parent_process_key
        )
        if process.id != latest_process.id:
            # Raise an exception if the process is not the latest version
            raise BusinessException(BusinessErrorCode.PROCESS_NOT_LATEST_VERSION)
        if process.status == ProcessStatus.PUBLISHED:
            # Raise an exception if the user try to update published process
            raise BusinessException(BusinessErrorCode.PROCESS_INVALID_OPERATION)

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
        major_version, minor_version = cls.determine_process_version(
            process.status,
            process.status_changed,
            process.major_version,
            process.minor_version,
        )

        # Create a new process instance with updated data
        process_dict = {
            "name": process_name,
            "process_type": process_type.upper(),
            "tenant": tenant_key,
            "process_data": process_data,
            "created_by": user.user_name,
            "major_version": major_version,
            "minor_version": minor_version,
            "is_subflow": process.is_subflow,
            "process_key": process_key,
            "parent_process_key": process.parent_process_key,
        }
        process = Process.create_from_dict(process_dict)

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
    def populate_published_histories(histories, published_histories):
        """Populating published on and publised by to the history."""
        published_history_dict = {
            f"{history.major_version}.{history.minor_version}": history
            for history in published_histories
        }
        for history in histories:
            published_history = published_history_dict.get(
                f"{history.major_version}.{history.minor_version}"
            )
            if published_history:
                history.published_on = published_history.created
                history.published_by = published_history.created_by
        return histories

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

        published_histories = Process.fetch_published_history_by_parent_process_key(
            parent_process_key
        )

        if process_histories:
            # populating published on and publised by to the history
            process_histories = ProcessService.populate_published_histories(
                process_histories, published_histories
            )
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

    @classmethod
    def deploy_process(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls, process_name, process_data, tenant_key, token, process_type
    ):
        """Deploy process."""
        # file path and type based on process type
        file_extension = (
            "dmn"
            if process_type and process_type.value == ProcessType.DMN.value
            else "bpmn"
        )
        file_path = f"{process_name}.{file_extension}"
        file_type = f"text/{file_extension}"
        # If process data empty deploy default workflow data.
        if process_data:
            if isinstance(process_data, str):
                process_data = process_data.encode("utf-8")
        else:
            process_data = default_flow_xml_data(process_name).encode("utf-8")

        # Prepare the parameters for the deployment
        payload = {
            "deployment-name": process_name,
            "enable-duplicate-filtering": "true",
            "deploy-changed-only": "false",
            "deployment-source": "Camunda Modeler",
            "tenant-id": tenant_key,
        }
        files = {"upload": (file_path, process_data, file_type)}
        BPMService.post_deployment(token, payload, tenant_key, files)

    @classmethod
    def update_process_status(cls, process, status, user):
        """Update process status."""
        process_dict = {
            "name": process.name,
            "process_type": process.process_type,
            "status": status,
            "tenant": user.tenant_key,
            "process_data": process.process_data,
            "created_by": user.user_name,
            "major_version": process.major_version,
            "minor_version": process.minor_version,
            "is_subflow": process.is_subflow,
            "process_key": process.process_key,
            "parent_process_key": process.parent_process_key,
            "status_changed": True,
        }
        process = Process.create_from_dict(process_dict)
        return process

    @classmethod
    @user_context
    def publish(cls, process_id, **kwargs):
        """Publish by process_id."""
        user: UserContext = kwargs["user"]
        process = cls.validate_process_by_id(process_id)
        latest = Process.get_latest_version_by_parent_key(process.parent_process_key)
        if process.id != latest.id:
            raise BusinessException(BusinessErrorCode.PROCESS_NOT_LATEST_VERSION)
        cls.update_process_status(process, ProcessStatus.PUBLISHED, user)
        cls.deploy_process(
            process.name,
            process.process_data,
            user.tenant_key,
            user.bearer_token,
            process.process_type,
        )
        return {}

    @classmethod
    @user_context
    def unpublish(cls, process_id, **kwargs):
        """Unpublish by process_id."""
        user: UserContext = kwargs["user"]
        process = cls.validate_process_by_id(process_id)
        latest = Process.get_latest_version_by_parent_key(process.parent_process_key)
        if process.id != latest.id:
            raise BusinessException(BusinessErrorCode.PROCESS_NOT_LATEST_VERSION)
        cls.update_process_status(process, ProcessStatus.DRAFT, user)
        return {}

    @classmethod
    def get_process_by_id(cls, process_id):
        """Get process by id."""
        current_app.logger.debug(f"Get process data for process id: {process_id}")
        process = Process.find_process_by_id(process_id)
        if process:
            return processSchema.dump(process)
        raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)

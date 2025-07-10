"""This exposes process service."""

import json
import re
from collections import Counter

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.user_context import UserContext, user_context
from lxml import etree

from formsflow_api.constants import BusinessErrorCode, default_flow_xml_data
from formsflow_api.models import (
    FormProcessMapper,
    Process,
    ProcessStatus,
    ProcessType,
)
from formsflow_api.schemas import (
    MigrateRequestSchema,
    ProcessDataSchema,
    ProcessHistorySchema,
    ProcessListRequestSchema,
)
from formsflow_api.services.external.bpm import BPMService

processSchema = ProcessDataSchema()


class ProcessService:  # pylint: disable=too-few-public-methods,too-many-public-methods
    """This class manages process service."""

    @classmethod
    def xml_parser(cls, process_data):
        """Parse the process data."""
        # pylint: disable=I1101
        parser = etree.XMLParser(resolve_entities=False)
        return etree.fromstring(process_data.encode("utf-8"), parser=parser)

    @classmethod
    def remove_duplicate_multitenant(cls, process_list, process_type):
        """Remove duplicates on default workflows provided."""
        # Incase of multitenant env, there's possiblity of duplicate workflow with tenant & without tenant
        # Exclude workflow without tenant in this scenario while migrating
        default_bpm_list = [
            "Defaultflow",
            "onestepapproval",
            "two-step-approval",
            "EmailNotification",
        ]
        default_dmn_list = ["email-template-example"]
        default_process_list = (
            default_dmn_list
            if process_type == ProcessType.DMN.value
            else default_bpm_list
        )
        # Count occurrences of each key in default_list in process list
        key_counts = Counter(
            process["key"]
            for process in process_list
            if process["key"] in default_process_list
        )
        # This variable is used to fetch default process which is found once & is without tenant
        unique_default_process_non_tenant_list = []
        for process in process_list:
            if (
                process["key"] in default_process_list
                and key_counts[process["key"]] == 1
                and process["tenantId"] is None
            ):
                unique_default_process_non_tenant_list.append(process["key"])
        # Filter process_list based on key counts and tenant condition
        filtered_process_list = [
            process
            for process in process_list
            if process["key"] not in default_process_list
            or key_counts[process["key"]] == 1
            or process["tenantId"] is not None
        ]
        return filtered_process_list, unique_default_process_non_tenant_list

    @classmethod
    def check_duplicate_names(cls, process_list):
        """Check for duplicate bpmn/dmn names before migrate."""
        # DMN/BPMN keys will be unique but names can be duplicate
        # To avoid exists error before migrate to process table make it unique
        current_app.logger.info("Check for duplicate bpmn/dmn names...")
        name_tenant_counts = {}
        name_tenant_suffix_tracker = {}

        # count occurrences and prepare suffix tracker
        for item in process_list:
            key = (item["name"], item["tenantId"])
            name_tenant_counts[key] = name_tenant_counts.get(key, 0) + 1

        # create the unique names based on the counts
        unique_name_process_list = []
        for item in process_list:
            key = (item["name"], item["tenantId"])
            if name_tenant_counts[key] > 1:
                # Increment suffix count and create new name
                name_tenant_suffix_tracker[key] = (
                    name_tenant_suffix_tracker.get(key, 0) + 1
                )
                new_name = f"{item['name']}_{name_tenant_suffix_tracker[key] - 1}"
            else:
                new_name = item["name"]

            # Append item with the unique name to the final list
            unique_name_process_list.append({**item, "name": new_name})
        return unique_name_process_list

    @classmethod
    @user_context
    def get_subflows_dmns(cls, process_type, **kwargs):
        """Fetch subflows & dmns from camunda & save to process table."""
        current_app.logger.debug(f"Fetching DMN/BPMN...{process_type}")
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        token = user.bearer_token
        process_list = []
        mapper_process_keys = []
        if process_type == ProcessType.BPMN.value:
            mappers = FormProcessMapper.find_all()
            mapper_process_keys = [mapper.process_key for mapper in mappers]
            current_app.logger.debug(f"mapper_process_keys...{mapper_process_keys}")
            url_path = "&includeProcessDefinitionsWithoutTenantId=true"
            process_list = BPMService.get_all_process(token, url_path)
        elif process_type == ProcessType.DMN.value:
            url_path = (
                "?latestVersion=true&includeDecisionDefinitionsWithoutTenantId=true"
            )
            process_list = BPMService.get_decision(token, url_path)
        if process_list:
            unique_default_non_tenant_list = []
            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                process_list, unique_default_non_tenant_list = (
                    cls.remove_duplicate_multitenant(process_list, process_type)
                )
            process_list = cls.check_duplicate_names(process_list)
            # Exclude process keys from mapper to exclude any keys present in unique_mapper_keys
            filtered_processes = [
                (process["key"], process["name"])
                for process in process_list
                if process["key"] not in set(mapper_process_keys)
            ]
            for process_key, process_name in filtered_processes:
                if process_key in unique_default_non_tenant_list:
                    tenant_key = None
                cls.fetch_save_xml(
                    process_key,
                    tenant_key=tenant_key,
                    process_type=process_type,
                    is_subflow=True,
                    process_name=process_name,
                )

    @classmethod
    def get_all_process(cls, request_args):  # pylint:disable=too-many-locals
        """Get all process list."""
        dict_data = ProcessListRequestSchema().load(request_args) or {}
        process_type = (
            dict_data.get("process_data_type").upper()
            if dict_data.get("process_data_type")
            else None
        )
        page_no = dict_data.get("page_no")
        limit = dict_data.get("limit")
        sort_by = dict_data.get("sort_by", "")
        process_id = dict_data.get("process_id")
        process_name = dict_data.get("name")
        status = dict_data.get("status").upper() if dict_data.get("status") else None
        created_by = dict_data.get("created_by")
        created_from_date = dict_data.get("created_from_date")
        created_to_date = dict_data.get("created_to_date")
        modified_from_date = dict_data.get("modified_from_date")
        modified_to_date = dict_data.get("modified_to_date")
        sort_order = dict_data.get("sort_order", "")
        sort_by = sort_by.split(",")
        sort_order = sort_order.split(",")

        def list_process():
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
            return process, count

        process, count = list_process()
        # If process empty consider it as subflows not migrated, so fetch from camunda
        if not process:
            # Check subflows exists without search before fetching from camunda.
            check_subflows_exists, count = Process.find_all_process(
                is_subflow=True,
                process_type=process_type,
            )
            if not check_subflows_exists:
                current_app.logger.debug("Fetching subflows...")
                cls.get_subflows_dmns(process_type)
                process, count = list_process()
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
        current_app.logger.debug(
            f"Process key: {process_key}, Process name: {process_name}"
        )
        # this code used to handle the pool component
        participant = None
        if process_type.lower() == "bpmn":
            ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
            # TBD: currently the root return process target that's why namespace used here again
            participant = root.find(".//bpmn:participant", namespaces=ns)

        # Note: If id have space in name, then process view in bpmn modeller throws error
        if process is not None:
            process.set("id", process_key or process_name)
            process.set("name", process_name)
            if participant is not None and participant.get("processRef"):
                participant.set("processRef", process_name)
                participant.set("name", process_name)

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
        is_migrate=False,
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
            is_migrate=is_migrate,
        )

        # Check if the process already exists if it is a subflow
        if is_subflow:
            if Process.find_process_by_name_key(
                name=process_name, process_key=process_key
            ):
                current_app.logger.debug(
                    f"Process already exists..{process_name}:-{process_key}"
                )
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
        return process

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
        is_migrate=False,
    ):
        """Process data name key."""
        # if the process is not a subflow, update the process name and ID in the XML data
        # if the process is a subflow, parse the XML data to extract the process name and key
        # if the process is of type LOWCODE, convert the process data to JSON format
        if is_subflow and process_type.upper() != "LOWCODE" and not is_migrate:
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

    @staticmethod
    def clean_form_name(name):
        """Remove invalid characters from form_name before setting as process key."""
        # Remove non-letters at the start, and any invalid characters elsewhere
        name = re.sub(r"(^[^a-zA-Z]+)|([^a-zA-Z0-9\-_])", "", name)
        return name

    @classmethod
    @user_context
    def fetch_save_xml(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        cls,
        process_key,
        tenant_key,
        process_type=ProcessType.BPMN.value,
        updated_process_key=None,
        is_subflow=False,
        process_name=None,
        xml_data=None,
        **kwargs,
    ):
        """Fetch process xml from camunda & save in process."""
        current_app.logger.debug(f"Fetch & save for process: {process_key}")
        user: UserContext = kwargs["user"]
        if not xml_data:
            current_app.logger.debug(f"Fetching xml for process: {process_key}")
            if process_type == ProcessType.DMN.value:
                xml_data = BPMService.decision_definition_xml(
                    process_key, user.bearer_token, tenant_key
                ).get("dmnXml")
            else:
                xml_data = BPMService.process_definition_xml(
                    process_key, user.bearer_token, tenant_key
                ).get("bpmn20Xml")
            current_app.logger.debug(
                f"Completed fetching xml for process: {process_key}"
            )
        # Incase of migration we need to use the filtered form name as process key
        process_key = updated_process_key if updated_process_key else process_key
        current_app.logger.debug(f"Create process: {process_key}")
        process = cls.create_process(
            process_data=xml_data,
            process_type=process_type,
            process_key=process_key,
            process_name=process_name if process_name else process_key,
            is_subflow=is_subflow,
            is_migrate=True,
        )
        current_app.logger.debug(f"Completed fetch &save process {process_key}")
        return process

    @classmethod
    def get_process_by_key(cls, process_key, request):
        """Get process by key."""
        current_app.logger.debug(f"Get process data for process key: {process_key}")
        process = Process.get_latest_version_by_key(process_key)
        mapper_id = request.args.get("mapperId")
        # If process is not found, fetch & save to process table.
        if not process and mapper_id:
            current_app.logger.debug("Process not found in db. Fetching & save it.")
            mapper = FormProcessMapper.find_form_by_id(mapper_id)
            process = cls.fetch_save_xml(mapper.process_key, mapper.process_tenant)
        if process:
            process_data = processSchema.dump(process)
            # Determine version numbers based on the process status
            major_version, minor_version = cls.determine_process_version(
                process.status,
                process.status_changed,
                process.major_version,
                process.minor_version,
            )
            process_data["majorVersion"] = major_version
            process_data["minorVersion"] = minor_version
            return process_data
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
            process_history_schema = ProcessHistorySchema()
            return process_history_schema.dump(process_histories, many=True), count
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

    @classmethod
    @user_context
    def migrate(cls, request, **kwargs):  # pylint:disable=too-many-locals
        """Migrate by process key."""
        current_app.logger.debug("Migrate process started..")
        user: UserContext = kwargs["user"]
        data = MigrateRequestSchema().load(request.get_json())
        process_key = data.get("process_key")
        mapper_id = data.get("mapper_id")
        request_mapper = FormProcessMapper.find_form_by_id(mapper_id)
        # If the process_key in the mapper is different from the process_key in the payload
        if request_mapper.process_key != process_key:
            raise BusinessException(BusinessErrorCode.INVALID_PROCESS)
        mappers = FormProcessMapper.get_mappers_by_process_key(process_key, mapper_id)
        current_app.logger.debug(f"Mappers found..{mappers}")
        if mappers:
            xml_data = None
            if not current_app.config.get("MULTI_TENANCY_ENABLED"):
                # Incase of non multitenant env, fetch once the process xml data
                current_app.logger.debug("Fetching process..")
                xml_data = BPMService.process_definition_xml(
                    process_key, user.bearer_token, user.tenant_key
                ).get("bpmn20Xml")
            for mapper in mappers:
                formio_service = FormioService()
                form_io_token = formio_service.get_formio_access_token()
                form_json = formio_service.get_form_by_id(mapper.form_id, form_io_token)
                form_name = form_json.get("name")
                # process key doesn't support numbers & special characters at start
                # special characters anywhere so clean them before setting as process key
                updated_process_key = cls.clean_form_name(form_name)
                if updated_process_key:
                    # validate process key already exists, if exists append mapper id to process_key.
                    process = Process.find_process_by_name_key(
                        name=updated_process_key, process_key=updated_process_key
                    )
                    if process:
                        updated_process_key = f"{updated_process_key}_{mapper.id}"
                # This is to avoid empty process_key after clean form name
                else:
                    updated_process_key = f"{process_key}_migrate_{mapper.id}"
                process = cls.fetch_save_xml(
                    process_key,
                    mapper.process_tenant,
                    updated_process_key=updated_process_key,
                    xml_data=xml_data,
                )
                # Update mapper with new process key & is_migrated as True
                mapper.update(
                    {
                        "is_migrated": True,
                        "process_key": updated_process_key,
                        "process_name": updated_process_key,
                    }
                )
                # Deploy process to camunda
                cls.deploy_process(
                    updated_process_key,
                    process.process_data,
                    user.tenant_key,
                    user.bearer_token,
                    ProcessType.BPMN,
                )
            # Update is_migrated to main mapper by id.
            request_mapper.update({"is_migrated": True})
        return {}

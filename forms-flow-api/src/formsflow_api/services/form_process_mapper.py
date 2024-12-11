"""This exposes form process mapper service."""

import json
import re
import xml.etree.ElementTree as ET
from typing import List, Set, Tuple

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode, default_flow_xml_data
from formsflow_api.models import (
    Application,
    Authorization,
    AuthType,
    Draft,
    FormHistory,
    FormProcessMapper,
    Process,
    ProcessStatus,
    ProcessType,
)
from formsflow_api.schemas import FormProcessMapperSchema
from formsflow_api.services.authorization import AuthorizationService
from formsflow_api.services.external.bpm import BPMService

from .form_history_logs import FormHistoryService
from .process import ProcessService


class FormProcessMapperService:  # pylint: disable=too-many-public-methods
    """This class manages form process mapper service."""

    @staticmethod
    @user_context
    def get_all_forms(  # pylint: disable=too-many-positional-arguments
        page_number: int,
        limit: int,
        search: list,
        sort_by: list,
        sort_order: list,
        form_type: str,
        is_active,
        is_designer: bool,
        active_forms: bool,
        **kwargs,
    ):  # pylint: disable=too-many-arguments, too-many-locals
        """Get all forms."""
        user: UserContext = kwargs["user"]
        authorized_form_ids: Set[str] = []
        current_app.logger.info(f"Listing forms for designer: {is_designer}")
        if active_forms:
            mappers, get_all_mappers_count = FormProcessMapper.find_all_active_forms(
                page_number=page_number,
                limit=limit,
            )
        else:
            form_ids = Authorization.find_all_resources_authorized(
                auth_type=AuthType.DESIGNER if is_designer else AuthType.FORM,
                roles=user.group_or_roles,
                user_name=user.user_name,
                tenant=user.tenant_key,
                include_created_by=is_designer,
            )
            for forms in form_ids:
                authorized_form_ids.append(forms.resource_id)
            designer_filters = {
                "is_active": is_active,
                "form_type": form_type,
            }
            list_form_mappers = (
                FormProcessMapper.find_all_forms
                if is_designer
                else FormProcessMapper.find_all_active_by_formid
            )
            mappers, get_all_mappers_count = list_form_mappers(
                page_number=page_number,
                limit=limit,
                search=search,
                sort_by=sort_by,
                sort_order=sort_order,
                form_ids=authorized_form_ids,
                **designer_filters if is_designer else {},
            )
        mapper_schema = FormProcessMapperSchema()
        return (
            mapper_schema.dump(mappers, many=True),
            get_all_mappers_count,
        )

    @staticmethod
    def get_mapper_count(form_name=None):
        """Get form process mapper count."""
        if form_name:
            return FormProcessMapper.find_count_form_name(form_name)

        return FormProcessMapper.find_all_count()

    @staticmethod
    @user_context
    def get_mapper(form_process_mapper_id: int, **kwargs):
        """Get form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    def get_form_version(mapper):
        """Get form versions."""
        version_data = FormHistory.get_latest_version(mapper.parent_form_id)
        major_version, minor_version = 1, 0
        if version_data:
            major_version = version_data.major_version
            minor_version = version_data.minor_version
        return major_version, minor_version

    @staticmethod
    @user_context
    def get_mapper_by_formid(form_id: str, **kwargs):
        """Get form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            mapper_schema = FormProcessMapperSchema()
            response = mapper_schema.dump(mapper)
            # Include form versions
            major_version, minor_version = FormProcessMapperService.get_form_version(
                mapper
            )
            response["majorVersion"] = major_version
            response["minorVersion"] = minor_version
            if response.get("deleted") is False:
                return response

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    @user_context
    def create_mapper(data, **kwargs):
        """Create new mapper between form and process."""
        user: UserContext = kwargs["user"]
        data["created_by"] = user.user_name
        data["tenant"] = user.tenant_key
        data["process_tenant"] = user.tenant_key
        return FormProcessMapper.create_from_dict(data)

    @staticmethod
    def _update_process_tenant(data, user):
        # For multi tenant environment find if the process is deployed for a tenant.
        if current_app.config.get("MULTI_TENANCY_ENABLED") and (
            process_key := data.get("process_key", None)
        ):
            current_app.logger.info("Finding Tenant ID for process %s ", process_key)
            data["process_tenant"] = BPMService.get_process_details_by_key(
                process_key, user.bearer_token
            ).get("tenantId", None)

    @staticmethod
    @user_context
    def update_mapper(form_process_mapper_id, data, **kwargs):
        """Update form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        data["modified_by"] = user.user_name
        mapper = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )

        if not data.get("comments"):
            data["comments"] = None
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            mapper.update(data)
            return mapper

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    @user_context
    def mark_inactive_and_delete(form_process_mapper_id: int, **kwargs) -> None:
        """Mark form process mapper as inactive and deleted."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        application = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )
        if application:
            if tenant_key is not None and application.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            count = Application.get_total_application_corresponding_to_mapper_id(
                form_process_mapper_id
            )
            if count > 0:
                raise BusinessException(BusinessErrorCode.RESTRICT_FORM_DELETE)
            application.mark_inactive()
            # fetching all draft application application and delete it
            draft_applications = Draft.get_draft_by_parent_form_id(
                parent_form_id=application.parent_form_id
            )
            if draft_applications:
                for draft in draft_applications:
                    draft.delete()
        else:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    def mark_unpublished(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        mapper = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )
        if mapper:
            mapper.mark_unpublished()
            return
        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    def get_mapper_by_formid_and_version(form_id: int, version: int):
        """Returns a serialized form process mapper given a form_id and version."""
        mapper = FormProcessMapper.find_mapper_by_form_id_and_version(form_id, version)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        return None

    @staticmethod
    def unpublish_previous_mapper(mapper_data: dict) -> None:
        """
        This method unpublishes the previous version of the form process mapper.

        : mapper_data: serialized create mapper payload
        : Should be called with create_mapper method
        """
        form_id = mapper_data.get("previous_form_id") or mapper_data.get("form_id")
        version = mapper_data.get("version")
        if version is None or form_id is None:
            return
        version = int(version) - 1
        previous_mapper = FormProcessMapperService.get_mapper_by_formid_and_version(
            form_id, version
        )
        previous_status = previous_mapper.get("status")
        if previous_mapper and previous_status == FormProcessMapperStatus.ACTIVE.value:
            previous_mapper_id = previous_mapper.get("id")
            FormProcessMapperService.mark_unpublished(previous_mapper_id)

    @staticmethod
    @user_context
    def check_tenant_authorization(mapper_id: int, **kwargs) -> int:
        """Check if tenant has permission to access the resource."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        if tenant_key is None:
            return 0
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id=mapper_id)
        if mapper is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return 0

    @staticmethod
    @user_context
    def check_tenant_authorization_by_formid(
        form_id: int, mapper_data=None, **kwargs
    ) -> int:
        """Check if tenant has permission to access the resource."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        if tenant_key is None:
            return
        # If mapper data is provided as an argument, there's no need to fetch it from the database
        mapper = (
            mapper_data
            if mapper_data
            else FormProcessMapper.find_form_by_form_id(form_id=form_id)
        )
        if mapper is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return

    @staticmethod
    def validate_process_and_update_mapper(name, mapper):
        """Validate process name/key exists, if exists update name & update mapper."""
        current_app.logger.info(f"Validating process key already exists. {name}")
        process = Process.find_process_by_name_key(name=name, process_key=name)
        if process:
            # Since the process key/name already exists create updated process key by appending mapper Id
            # Update mapper with updated value
            updated_process_name = f"{name}_{mapper.id}"
            mapper.process_key = updated_process_name
            mapper.process_name = updated_process_name
            mapper.save()
            return updated_process_name
        return None

    @staticmethod
    def mapper_create(mapper_json):
        """Service to handle mapper create."""
        current_app.logger.debug("Creating mapper..")
        mapper_json["taskVariables"] = json.dumps(
            mapper_json.get("taskVariables") or []
        )
        mapper_schema = FormProcessMapperSchema()
        dict_data = mapper_schema.load(mapper_json)
        mapper = FormProcessMapperService.create_mapper(dict_data)

        FormProcessMapperService.unpublish_previous_mapper(dict_data)
        return mapper

    @staticmethod
    def form_design_update(data, form_id):
        """Service to handle form design update."""
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        FormProcessMapperService.check_tenant_authorization_by_formid(
            form_id=form_id, mapper_data=mapper
        )
        formio_service = FormioService()
        form_io_token = formio_service.get_formio_access_token()
        response = formio_service.update_form(form_id, data, form_io_token)
        # if user selected to continue with minor version after unpublish
        if mapper.prompt_new_version:
            mapper.update({"prompt_new_version": False})
        FormHistoryService.create_form_log_with_clone(data=data)
        return response

    @classmethod
    @user_context
    def create_default_process(cls, process_name, status=ProcessStatus.DRAFT, **kwargs):
        """Create process with default workflow."""
        user: UserContext = kwargs["user"]
        process_dict = {
            "name": process_name,
            "process_key": process_name,
            "parent_process_key": process_name,
            "process_type": ProcessType.BPMN,
            "status": status,
            "process_data": default_flow_xml_data(process_name).encode("utf-8"),
            "tenant": user.tenant_key,
            "major_version": 1,
            "minor_version": 0,
            "created_by": user.user_name,
        }
        process = Process.create_from_dict(process_dict)
        return process

    @staticmethod
    @user_context
    def create_form(data, is_designer, **kwargs):  # pylint:disable=too-many-locals
        """Service to handle form create."""
        current_app.logger.info("Creating form..")
        user: UserContext = kwargs["user"]
        # Initialize formio service and get formio token to create the form
        formio_service = FormioService()
        form_io_token = formio_service.get_formio_access_token()
        # creating form and get response from formio
        response = formio_service.create_form(data, form_io_token)
        form_id = response.get("_id")
        parent_form_id = data.get("parentFormId", form_id)
        # is_new_form=True if creating a new form, False if creating a new version
        is_new_form = parent_form_id == form_id
        process_key = None
        anonymous = False
        description = data.get("description", "")
        task_variable = []
        is_migrated = True
        current_app.logger.info(f"Creating new form {is_new_form}")
        # If creating new version for a existing form, fetch process key, name from mapper
        if not is_new_form:
            current_app.logger.debug("Fetching details from mapper")
            mapper = FormProcessMapper.get_latest_by_parent_form_id(parent_form_id)
            process_name = mapper.process_name
            process_key = mapper.process_key
            anonymous = mapper.is_anonymous
            description = mapper.description
            task_variable = json.loads(mapper.task_variable)
            is_migrated = mapper.is_migrated
        else:
            # if new form, form name is kept as process_name & process key
            process_name = response.get("name")
            # process key/Id doesn't support numbers & special characters at start
            # special characters anywhere so clean them before setting as process key
            process_name = ProcessService.clean_form_name(process_name)

        mapper_data = {
            "formId": form_id,
            "formName": response.get("title"),
            "description": description,
            "formType": response.get("type"),
            "processKey": process_name,
            "processName": process_key if process_key else process_name,
            "formTypeChanged": True,
            "parentFormId": parent_form_id,
            "titleChanged": True,
            "formRevisionNumber": "V1",
            "status": FormProcessMapperStatus.INACTIVE.value,
            "anonymous": anonymous,
            "taskVariables": task_variable,
            "isMigrated": is_migrated,
        }

        mapper = FormProcessMapperService.mapper_create(mapper_data)
        current_app.logger.debug("Creating form log with clone..")
        FormHistoryService.create_form_log_with_clone(
            data={
                **response,
                "parentFormId": parent_form_id,
                "newVersion": True,
                "componentChanged": True,
            }
        )
        if is_new_form:
            # create default data for authorization of the resource
            authorization_data = {
                "application": {
                    "resourceId": parent_form_id,
                    "resourceDetails": {"submitter": True},
                    "roles": [],
                    "userName": None,
                },
                "designer": {
                    "resourceId": parent_form_id,
                    "resourceDetails": {},
                    "roles": [],
                    "userName": user.user_name,
                },
                "form": {
                    "resourceId": parent_form_id,
                    "resourceDetails": {},
                    "roles": [],
                },
            }
            current_app.logger.debug(
                "Creating default data for authorization of the resource.."
            )
            AuthorizationService.create_or_update_resource_authorization(
                authorization_data, is_designer=is_designer
            )
            # validate process key already exists, if exists append mapper id to process_key.
            updated_process_name = (
                FormProcessMapperService.validate_process_and_update_mapper(
                    process_name, mapper
                )
            )
            process_name = (
                updated_process_name if updated_process_name else process_name
            )
            process_data = data.get("processData")
            process_type = data.get("processType")
            if process_data and process_type:
                # Incase of duplicate form we get process data from payload
                ProcessService.create_process(
                    process_data, process_type, process_name, process_name
                )
            else:
                # create entry in process with default flow.
                FormProcessMapperService.create_default_process(process_name)
        return response

    def _remove_tenant_key(self, form_json, tenant_key):
        """Remove tenant key from path & name."""
        tenant_prefix = f"{tenant_key}-"
        form_path = form_json.get("path", "")
        form_name = form_json.get("name", "")
        current_app.logger.info(
            f"Removing tenant key from path: {form_path} & name: {form_name}"
        )
        if form_path.startswith(tenant_prefix):
            form_json["path"] = form_path[len(tenant_prefix) :]

        if form_name.startswith(tenant_prefix):
            form_json["name"] = form_name[len(tenant_prefix) :]
        return form_json

    def _sanitize_form_json(self, form_json, tenant_key):
        """Clean form JSON data for export."""
        keys_to_remove = [
            "_id",
            "machineName",
            "access",
            "submissionAccess",
            "parentFormId",
            "owner",
            "tenantKey",
        ]
        for key in keys_to_remove:
            form_json.pop(key, None)
        # Remove 'tenantkey-' from 'path' and 'name'
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            form_json = self._remove_tenant_key(form_json, tenant_key)
        return form_json

    def _get_form(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self,
        title_or_path: str,
        scope_type: str,
        form_id: str = None,
        description: str = None,
        tenant_key: str = None,
        anonymous: bool = False,
    ) -> dict:
        """Get form details."""
        try:
            current_app.logger.info(f"Fetching form : {title_or_path}")
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            if form_id:
                form_json = formio_service.get_form_by_id(form_id, form_io_token)
            else:
                form_json = formio_service.get_form_by_path(
                    title_or_path, form_io_token
                )
            if not form_json:
                raise BusinessException(BusinessErrorCode.INVALID_FORM_ID)
            # In a (sub form)connected form, the workflow provides the form path,
            # and the title is obtained from the form JSON
            title_or_path = (
                form_json.get("title", "") if scope_type == "sub" else title_or_path
            )
            form_json = self._sanitize_form_json(form_json, tenant_key)

            return {
                "formTitle": title_or_path,
                "formDescription": description,
                "anonymous": anonymous or False,
                "type": scope_type,
                "content": form_json,
            }
        except Exception as e:
            current_app.logger.error(e)
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND) from e

    def _get_workflow(
        self, process_key: str, process_name: str, scope_type: str
    ) -> dict:
        """Get workflow details."""
        current_app.logger.info(f"Fetching Process : {process_key}")
        process = Process.get_latest_version_by_key(process_key)
        if process:
            process_data = process.process_data.decode("utf-8")
            process_type = process.process_type.value
            content = (
                json.loads(process_data) if process_type == "LOWCODE" else process_data
            )
            return {
                "processKey": process_key,
                "processName": process_name,
                "processType": process_type,
                "type": scope_type,
                "content": content,
            }
        raise BusinessException(BusinessErrorCode.PROCESS_DEF_NOT_FOUND)

    def _get_dmn(self, dmn_key: str, scope_type: str, user: UserContext) -> dict:
        """Get DMN details."""
        try:
            current_app.logger.info(f"Fetching xml for DMN: {dmn_key}")
            dmn_tenant = None
            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                url_path = (
                    f"?latestVersion=true&includeDecisionDefinitionsWithoutTenantId=true"
                    f"&key={dmn_key}&tenantIdIn={user.tenant_key}"
                )
                dmn = BPMService.get_decision(user.bearer_token, url_path)
                if dmn:
                    dmn_tenant = dmn[0].get("tenantId")
                    current_app.logger.info(
                        f"Found tenant ID: {dmn_tenant} for DMN: {dmn_key}"
                    )
            dmn_xml = BPMService.decision_definition_xml(
                dmn_key, user.bearer_token, dmn_tenant
            ).get("dmnXml")
            return {
                "key": dmn_key,
                "type": scope_type,
                "content": dmn_xml,
            }
        except Exception as e:
            current_app.logger.error(e)
            raise BusinessException(BusinessErrorCode.DECISION_DEF_NOT_FOUND) from e

    def _get_authorizations(self, resource_id: str, user) -> dict:
        """Get authorization details."""
        auth_details = Authorization.find_auth_list_by_id(resource_id, user.tenant_key)
        auth_detail = {}
        for auth in auth_details:
            auth_detail[auth.auth_type.value] = {
                "resourceId": auth.resource_id,
                "resourceDetails": auth.resource_details,
                "roles": auth.roles,
                "userName": None,
            }
        return auth_detail

    def _parse_xml(  # pylint:disable=too-many-locals
        self, bpmn_xml: str, user: UserContext
    ) -> Tuple[List[str], List[str], List[dict]]:
        """Parse the XML string."""
        current_app.logger.info("Parsing XML...")
        root = ET.fromstring(bpmn_xml)
        namespaces = {
            "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "camunda": "http://camunda.org/schema/1.0/bpmn",
        }

        form_names = []
        dmn_names = []
        workflows = []

        # Find all 'camunda:taskListener' with class="FormConnectorListener"
        current_app.logger.info("Search for task with form connector...")
        form_connector_tasks = root.findall(
            ".//camunda:taskListener"
            "[@class='org.camunda.bpm.extension.hooks.listeners.task.FormConnectorListener']"
            "/../camunda:properties/camunda:property",
            namespaces,
        )

        for task in form_connector_tasks:
            if task.get("name") == "formName":
                form_names.append(task.get("value"))
        current_app.logger.info(f"Forms found: {form_names}")

        # Find DMNs
        current_app.logger.info("Search for task with DMN...")
        dmn_tasks = root.findall(
            ".//bpmn:businessRuleTask[@camunda:decisionRef]", namespaces
        )
        for task in dmn_tasks:
            decision_ref = task.attrib.get(
                "{http://camunda.org/schema/1.0/bpmn}decisionRef"
            )
            dmn_names.append(decision_ref)
            current_app.logger.info(
                f"Task ID: {task.attrib.get('id')}, DMN: {decision_ref}"
            )

        # Find subprocesses
        current_app.logger.info("Search for subprocess...")
        sub_processes = root.findall(".//bpmn:callActivity[@calledElement]", namespaces)
        for subprocess in sub_processes:
            subprocess_name = subprocess.attrib.get("calledElement")
            current_app.logger.info(f"Subprocess: {subprocess_name}")
            # Here subprocess_name will be the process key
            # Since we didn't get process name, we will use the subprocess name as process name
            sub_workflow = self._get_workflow(subprocess_name, subprocess_name, "sub")
            workflows.append(sub_workflow)

            sub_form_names, sub_dmn_names, sub_workflows = self._parse_xml(
                sub_workflow["content"], user
            )

            form_names.extend(sub_form_names)
            dmn_names.extend(sub_dmn_names)
            workflows.extend(sub_workflows)

        return form_names, dmn_names, workflows

    @user_context
    def export(  # pylint:disable=too-many-locals
        self, mapper_id: int, **kwargs
    ) -> dict:
        """Export form & workflow."""
        current_app.logger.info(f"Exporting form process mapper: {mapper_id}")
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id=mapper_id)
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key

        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise PermissionError(BusinessErrorCode.PERMISSION_DENIED)

            forms = []
            workflows = []
            rules = []
            authorizations = []

            # Capture main form & workflow
            forms.append(
                self._get_form(
                    mapper.form_name,
                    "main",
                    mapper.form_id,
                    mapper.description,
                    tenant_key,
                    mapper.is_anonymous,
                )
            )
            workflow = self._get_workflow(
                mapper.process_key, mapper.process_name, "main"
            )
            workflows.append(workflow)
            authorizations.append(self._get_authorizations(mapper.parent_form_id, user))

            # Parse bpm xml to get subforms & workflows
            # The following lines are currently commented out but may be needed for future use.
            # forms_names, dmns, sub_workflows = self._parse_xml(
            #     workflow["content"], user
            # )

            # for form in set(forms_names):
            #     forms.append(
            #         self._get_form(form, "sub", form_id=None, description=None, tenant_key=tenant_key)
            #     )
            # for dmn in set(dmns):
            #     rules.append(self._get_dmn(dmn, "sub", user))

            # workflows.extend(sub_workflows)

            return {
                "forms": forms,
                "workflows": workflows,
                "rules": rules,
                "authorizations": authorizations,
            }

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @classmethod
    def is_valid_field(cls, field: str, pattern: str) -> bool:
        """Checks if the given field matches the provided regex pattern."""
        return bool(re.fullmatch(pattern, field))

    @classmethod
    def validate_title_name_path(cls, title: str, path: str, name: str):
        """Validates the title, path, and name fields."""
        title_pattern = r"(?=.*[A-Za-z])[A-Za-z0-9 ]+"
        path_name = r"(?=.*[A-Za-z])[A-Za-z0-9]+"

        invalid_fields = []

        error_messages = {
            "title": "Title: Only contain alphanumeric characters and spaces, and must include at least one letter.",
            "path": "Path: Only contain alphanumeric characters, no spaces, and must include at least one letter.",
            "name": "Name: Only contain alphanumeric characters, no spaces, and must include at least one letter.",
        }

        # Validate title
        if title and not cls.is_valid_field(title, title_pattern):
            invalid_fields.append("title")

        # Validate path and name
        for field_name, field_value in (("path", path), ("name", name)):
            if field_value and not cls.is_valid_field(field_value, path_name):
                invalid_fields.append(field_name)

        # Determine overall validity
        is_valid = len(invalid_fields) == 0
        if not is_valid:
            # Generate detailed validation error message
            error_message = ",\n ".join(
                error_messages[field] for field in invalid_fields
            )
            raise BusinessException(
                BusinessErrorCode.FORM_VALIDATION_FAILED,
                detail_message=error_message,
                include_details=True,
            )

    @classmethod
    def validate_form_title(cls, title, exclude_id=None):
        """Validate form tile in the form_process_mapper table."""
        # Exclude the current mapper from the query
        current_app.logger.info(
            f"Validation for form title...{title}..with exclude id-{exclude_id}"
        )
        mappers = FormProcessMapper.find_forms_by_title(title, exclude_id=exclude_id)
        if mappers:
            current_app.logger.debug(f"Other mappers matching the title- {mappers}")
            raise BusinessException(BusinessErrorCode.FORM_EXISTS)
        return True

    @staticmethod
    @user_context
    def validate_form_name_path_title(request, **kwargs):
        """Validate a form name by calling the external validation API."""
        # Retrieve the parameters from the query string
        title = request.args.get("title")
        name = request.args.get("name")
        path = request.args.get("path")
        form_id = request.args.get("id")

        # Check if at least one query parameter is provided
        if not (title or name or path):
            raise BusinessException(BusinessErrorCode.INVALID_FORM_VALIDATION_INPUT)

        if title and len(title) > 200:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_TITLE_LENGTH)

        FormProcessMapperService.validate_title_name_path(title, path, name)

        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            user: UserContext = kwargs["user"]
            tenant_key = user.tenant_key
            name = f"{tenant_key}-{name}"
            path = f"{tenant_key}-{path}"
        # Validate title exists validation on mapper & path, name in formio.
        if title:
            FormProcessMapperService.validate_form_title(title)
        # Validate path, name exits in formio.
        if path or name:
            query_params = f"name={name}&path={path}&select=title,path,name"
            # Initialize the FormioService and get the access token
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            validation_response = formio_service.get_form_search(
                query_params, form_io_token
            )

            # Check if the validation response has any results
            if validation_response:
                # Check if the form ID matches
                if (
                    form_id
                    and len(validation_response) == 1
                    and validation_response[0].get("_id") == form_id
                ):
                    return {}
                # If there are results but no matching ID, the form name is still considered invalid
                raise BusinessException(BusinessErrorCode.FORM_EXISTS)
        # If no results, the form name is valid
        return {}

    def validate_mapper(self, mapper_id, tenant_key):
        """Validate mapper by mapper Id."""
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id=mapper_id)
        if not mapper:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

        # Check tenant authentication
        if tenant_key and mapper.tenant != tenant_key:
            raise PermissionError(BusinessErrorCode.PERMISSION_DENIED)
        # Check the mapper_id provided is the latest mapper for the specific parent_form_id.
        latest = FormProcessMapper.get_latest_by_parent_form_id(mapper.parent_form_id)
        if latest and mapper.id != latest.id:
            raise BusinessException(BusinessErrorCode.MAPPER_NOT_LATEST_VERSION)
        return mapper

    def capture_form_history(self, mapper, data, user_name):
        """Capture form history."""
        major_version, minor_version = 1, 0
        latest_form_history = FormHistory.get_latest_version(mapper.parent_form_id)
        if latest_form_history:
            major_version, minor_version = (
                latest_form_history.major_version,
                latest_form_history.minor_version,
            )
        FormHistory(
            created_by=user_name,
            parent_form_id=mapper.parent_form_id,
            form_id=mapper.form_id,
            change_log=data,
            status=True,
            major_version=major_version,
            minor_version=minor_version,
        ).save()

    @user_context
    def publish(self, mapper_id, **kwargs):
        """Publish by mapper_id."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        token = user.bearer_token
        user_name = user.user_name
        mapper = self.validate_mapper(mapper_id, tenant_key)
        process_name = mapper.process_key

        # Fetch process data from process table
        process = Process.get_latest_version_by_key(process_name)
        process_data, process_type = (
            (process.process_data, process.process_type) if process else (None, None)
        )

        # Deploy process
        ProcessService.deploy_process(
            process_name, process_data, tenant_key, token, process_type
        )
        if not process:
            # create entry in process with default flow with status "PUBLISHED".
            FormProcessMapperService.create_default_process(
                process_name, status=ProcessStatus.PUBLISHED
            )
        else:
            # Update process status
            ProcessService.update_process_status(process, ProcessStatus.PUBLISHED, user)

        # Capture publish(active) status in form history table.
        self.capture_form_history(mapper, {"status": "active"}, user_name)
        # Update status in mapper table
        mapper.update(
            {
                "status": str(FormProcessMapperStatus.ACTIVE.value),
                "prompt_new_version": False,
            }
        )
        return {}

    @user_context
    def unpublish(self, mapper_id: int, **kwargs):
        """Publish by mapper_id."""
        user: UserContext = kwargs["user"]
        user_name = user.user_name
        tenant_key = user.tenant_key
        mapper = self.validate_mapper(mapper_id, tenant_key)
        # Capture unpublish status in form history table.
        self.capture_form_history(mapper, {"status": "inactive"}, user_name)
        # Update status(inactive) in mapper table
        mapper.update(
            {
                "status": str(FormProcessMapperStatus.INACTIVE.value),
                "prompt_new_version": True,
            }
        )
        # Update process status to Draft
        process = Process.get_latest_version_by_key(mapper.process_key)
        if process:
            ProcessService.update_process_status(process, ProcessStatus.DRAFT, user)
        return {}

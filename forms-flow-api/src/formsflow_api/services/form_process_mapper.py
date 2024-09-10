"""This exposes form process mapper service."""

import json
import xml.etree.ElementTree as ET
from typing import List, Set, Tuple

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import (
    Authorization,
    AuthType,
    Draft,
    FormProcessMapper,
)
from formsflow_api.schemas import FormProcessMapperSchema
from formsflow_api.services.external.bpm import BPMService

from .form_history_logs import FormHistoryService


class FormProcessMapperService:
    """This class manages form process mapper service."""

    @staticmethod
    @user_context
    def get_all_forms(
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
        FormProcessMapperService._update_process_tenant(data, user)
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
        if not data.get("process_key") and data.get("process_name"):
            data["process_key"] = None
            data["process_name"] = None

        if not data.get("comments"):
            data["comments"] = None
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            FormProcessMapperService._update_process_tenant(data, user)
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
        mapper = FormProcessMapper.find_form_by_id_active_status(
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
    def check_tenant_authorization_by_formid(form_id: int, **kwargs) -> int:
        """Check if tenant has permission to access the resource."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        if tenant_key is None:
            return
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        if mapper is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return

    @staticmethod
    def mapper_create(mapper_json):
        """Service to handle mapper create."""
        mapper_json["taskVariable"] = json.dumps(mapper_json.get("taskVariable") or [])
        mapper_schema = FormProcessMapperSchema()
        dict_data = mapper_schema.load(mapper_json)
        mapper = FormProcessMapperService.create_mapper(dict_data)

        FormProcessMapperService.unpublish_previous_mapper(dict_data)

        response = mapper_schema.dump(mapper)
        response["taskVariable"] = json.loads(response["taskVariable"])

        FormHistoryService.create_form_logs_without_clone(data=mapper_json)
        return response

    @staticmethod
    def form_design_update(data, form_id):
        """Service to handle form design update."""
        FormProcessMapperService.check_tenant_authorization_by_formid(form_id=form_id)
        formio_service = FormioService()
        form_io_token = formio_service.get_formio_access_token()
        response = formio_service.update_form(form_id, data, form_io_token)
        FormHistoryService.create_form_log_with_clone(data=data)
        return response

    def _get_form(  # pylint: disable=too-many-arguments
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
            if form_json:
                form_json.pop("_id", None)
                form_json.pop("machineName", None)
                # In a (sub form)connected form, the workflow provides the form path,
                # and the title is obtained from the form JSON
                title_or_path = (
                    form_json.get("title", "") if scope_type == "sub" else title_or_path
                )
                # Remove 'tenantkey-' from 'path' and 'name'
                if current_app.config.get("MULTI_TENANCY_ENABLED"):
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
            return {
                "formTitle": title_or_path,
                "formDescription": description,
                "anonymous": anonymous,
                "type": scope_type,
                "content": form_json,
            }
        except Exception as e:
            current_app.logger.error(e)
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND) from e

    def _get_workflow(
        self, process_key: str, process_name: str, scope_type: str, user: UserContext
    ) -> dict:
        """Get workflow details."""
        try:
            current_app.logger.info(f"Fetching xml for process: {process_key}")
            process_tenant = None
            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                url_path = (
                    f"&includeProcessDefinitionsWithoutTenantId=true"
                    f"&key={process_key}&tenantIdIn={user.tenant_key}"
                )
                process = BPMService.get_all_process(user.bearer_token, url_path)
                if process:
                    process_tenant = process[0].get("tenantId")
                    current_app.logger.info(
                        f"Found tenant ID {process_tenant} for process {process_key}"
                    )
            xml = BPMService.process_definition_xml(
                process_key, user.bearer_token, process_tenant
            ).get("bpmn20Xml")
            return {
                "processKey": process_key,
                "processName": process_name,
                "type": scope_type,
                "content": xml,
            }
        except Exception as e:
            current_app.logger.error(e)
            raise BusinessException(BusinessErrorCode.PROCESS_DEF_NOT_FOUND) from e

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
                "userName": auth.user_name,
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
            sub_workflow = self._get_workflow(
                subprocess_name, subprocess_name, "sub", user
            )
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
                mapper.process_key, mapper.process_name, "main", user
            )
            workflows.append(workflow)
            authorizations.append(self._get_authorizations(mapper.form_id, user))

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

    @staticmethod
    def validate_form_name_path_title(request):
        """Validate a form name by calling the external validation API."""
        # Retrieve the parameters from the query string
        title = request.args.get("title")
        name = request.args.get("name")
        path = request.args.get("path")
        form_id = request.args.get("id")

        # Check if at least one query parameter is provided
        if not (title or name or path):
            raise BusinessException(BusinessErrorCode.INVALID_FORM_VALIDATION_INPUT)

        # Combine them into query parameters dictionary
        query_params = f"title={title}&name={name}&path={path}&select=title,path,name"

        # Initialize the FormioService and get the access token
        formio_service = FormioService()
        form_io_token = formio_service.get_formio_access_token()
        # Call the external validation API
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

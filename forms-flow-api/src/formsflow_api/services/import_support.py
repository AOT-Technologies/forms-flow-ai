"""This exposes Import service."""

import json
from uuid import uuid1

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import Cache
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.startup import collect_role_ids
from formsflow_api_utils.utils.user_context import UserContext, user_context
from jsonschema import ValidationError, validate
from lxml import etree

from formsflow_api.constants import BusinessErrorCode, default_task_variables
from formsflow_api.models import AuthType, FormHistory, Process, ProcessType
from formsflow_api.schemas import (
    FormProcessMapperSchema,
    ImportEditRequestSchema,
    ImportRequestSchema,
    ProcessDataSchema,
    form_schema,
    form_workflow_schema,
)
from formsflow_api.services.external.admin import AdminService

from .authorization import AuthorizationService
from .form_history_logs import FormHistoryService
from .form_process_mapper import FormProcessMapperService
from .process import ProcessService


class ImportService:  # pylint: disable=too-many-public-methods
    """This class manages import service."""

    def __init__(self) -> None:
        """Initialize."""
        self.formio = FormioService()
        self.auth_service = AuthorizationService()

    def __get_formio_access_token(self):
        """Returns formio access token."""
        return self.formio.get_formio_access_token()

    def append_tenant_key_form_name_path(self, form_json, tenant_key):
        """Append tenant key to form name & path."""
        name = form_json.get("name")
        path = form_json.get("path")
        current_app.logger.debug(
            f"Appending tenant key: {tenant_key} to form name: {name}  & path: {path}.."
        )
        form_json["name"] = f"{tenant_key}-{name}"
        form_json["path"] = f"{tenant_key}-{path}"
        return form_json

    @user_context
    def set_form_and_submission_access(self, form_data, anonymous, **kwargs):
        """Add form and submission access to form."""
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            user: UserContext = kwargs["user"]
            url = f"{current_app.config.get('ADMIN_URL')}/tenant"
            current_app.logger.debug(f"Admin url: {url}")
            response = AdminService.get_request(url, user.bearer_token)
            role_ids = response["form"]
            form_data["tenantKey"] = user.tenant_key
        else:
            role_ids = Cache.get("formio_role_ids")
            if not role_ids:
                collect_role_ids(current_app)
                role_ids = Cache.get("formio_role_ids")

        role_dict = {role["type"]: role["roleId"] for role in role_ids}

        client_id = role_dict.get("CLIENT")
        designer_id = role_dict.get("DESIGNER")
        reviewer_id = role_dict.get("REVIEWER")
        anonymous_id = role_dict.get("ANONYMOUS")

        # Include anonymous_id, if anonymous is True
        read_all_roles = [client_id, designer_id, reviewer_id]
        create_own_roles = [client_id]
        if anonymous:
            read_all_roles.append(anonymous_id)
            create_own_roles.append(anonymous_id)

        form_data["access"] = [
            {
                "type": "read_all",
                "roles": read_all_roles,
            },
            {
                "type": "update_all",
                "roles": [designer_id],
            },
            {
                "type": "delete_all",
                "roles": [designer_id],
            },
        ]

        form_data["submissionAccess"] = [
            {
                "roles": [designer_id],
                "type": "create_all",
            },
            {
                "roles": [reviewer_id],
                "type": "read_all",
            },
            {
                "roles": [reviewer_id],
                "type": "update_all",
            },
            {
                "roles": [designer_id, reviewer_id],
                "type": "delete_all",
            },
            {
                "roles": create_own_roles,
                "type": "create_own",
            },
            {
                "roles": [client_id],
                "type": "read_own",
            },
            {
                "roles": [client_id],
                "type": "update_own",
            },
            {
                "roles": [reviewer_id],
                "type": "delete_own",
            },
        ]
        return form_data

    @user_context
    def create_authorization(self, data, new_import=False, **kwargs):
        """Create authorization."""
        for auth_type in AuthType:
            if auth_type.value in [
                AuthType.APPLICATION.value,
                AuthType.FORM.value,
                AuthType.DESIGNER.value,
            ]:
                auth_data = data.get(auth_type.value.upper())
                is_designer = auth_type.value == AuthType.DESIGNER.value
                # If edit import, add created_by user as username in case of designer
                edit_import_designer = not new_import and is_designer
                # Update designer's username if new_import
                if new_import is True and is_designer:
                    user: UserContext = kwargs["user"]
                    auth_data["userName"] = user.user_name
                self.auth_service.create_authorization(
                    auth_type.value.upper(),
                    auth_data,
                    is_designer=True,
                    edit_import_designer=edit_import_designer,
                )

    def get_latest_version_workflow(self, process_name):
        """Get latest version of workflow by process name."""
        process = Process.get_latest_version_by_key(process_name)
        # If process not found, consider as initial version
        if not process:
            return (1, 0, None, None)
        return (
            process.major_version,
            process.minor_version,
            process.status,
            process.status_changed,
        )

    def determine_process_version_by_key(self, name):
        """Finding the process version by process key."""
        major_version, minor_version, status, status_changed = (
            self.get_latest_version_workflow(name)
        )
        return ProcessService.determine_process_version(
            status, status_changed, major_version, minor_version
        )

    def get_latest_version_form(self, parent_form_id):
        """Get latest version of form by parent ID."""
        version_data = FormHistory.get_latest_version(parent_form_id)
        if not version_data:
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND)
        return version_data.major_version, version_data.minor_version

    def form_create(self, data):
        """Create form in formio."""
        return self.formio.create_form(data, self.__get_formio_access_token())

    def form_update(self, data, form_id):
        """Update form in formio."""
        return self.formio.update_form(form_id, data, self.__get_formio_access_token())

    def get_form_by_formid(self, form_id):
        """Get form by form ID."""
        return self.formio.get_form_by_id(form_id, self.__get_formio_access_token())

    def get_form_by_query(self, query_params):
        """Get form by query."""
        return self.formio.get_form_search(
            query_params, self.__get_formio_access_token()
        )

    def get_process_details(self, file_data):
        """Get workflow details from the imported file."""
        process_data = file_data.get("workflows")[0].get("content")
        process_type = file_data.get("workflows")[0].get(
            "processType", ProcessType.BPMN.value
        )
        return process_data, process_type

    def validate_file_type(self, filename: str, file_types: tuple):
        """Validate file type."""
        current_app.logger.info(f"Validating file type for file.{filename}")
        for file_type in file_types:
            if filename.endswith(file_type):
                return file_type
        return None

    def validate_input_json(self, data, workflow_form_schema):
        """Validate JSON."""
        try:
            validate(instance=data, schema=workflow_form_schema)
            current_app.logger.info("Valid json.")
            return True
        except ValidationError:
            return False

    def read_json_data(self, file):
        """Read JSON file."""
        file_content = file.read().decode("utf-8")
        file_data = json.loads(file_content)
        return file_data

    def validate_input_data(self, request):
        """Validate input data."""
        # Get the uploaded file from the request
        file = request.files.get("file")
        if not file or not file.filename:
            raise BusinessException(BusinessErrorCode.FILE_NOT_FOUND)
        # Get the request data
        request_data = request.form.get("data")
        current_app.logger.info(f"Request data...{request_data}")

        if request_data:
            try:
                request_data = json.loads(request_data)
            except json.JSONDecodeError as err:
                raise BusinessException(BusinessErrorCode.INVALID_INPUT) from err
        return request_data, file

    def validate_form(
        self, form_json, tenant_key, validate_path_only=False, mapper=None
    ):
        """Validate form already exists & title/path/name validation."""
        title = form_json.get("title")
        name = form_json.get("name")
        path = form_json.get("path")
        # Validate form title, name, path
        FormProcessMapperService.validate_title_name_path(title, path, name)
        # Add 'tenantkey-' from 'path' and 'name'
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            if not validate_path_only:
                name = f"{tenant_key}-{name}"
            path = f"{tenant_key}-{path}"

        if len(title) > 200 or len(name) > 200:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_TITLE_LENGTH)

        # Build query params based on validation type
        if validate_path_only and mapper:
            # In case of edit import validate title in mapper table & path in formio.
            FormProcessMapperService.validate_form_title(title, mapper.parent_form_id)
            query_params = f"path={path}&select=title,path,name,_id"
        else:
            # In case of new import validate title in mapper table & path,name in formio.
            FormProcessMapperService.validate_form_title(title, exclude_id=None)
            query_params = f"path={path}&name={name}&select=title,path,name,_id"
        current_app.logger.info(f"Validating form exists...{query_params}")
        response = self.get_form_by_query(query_params)
        return response

    def validate_edit_form_exists(self, form_json, mapper, tenant_key):
        """Validate form exists on edit import."""
        current_app.logger.info("Validating form exists in import edit...")
        response = self.validate_form(
            form_json, tenant_key, validate_path_only=True, mapper=mapper
        )
        # If response is not empty, check if the form_id is not the same as the mapper form_id
        # Then the path is taken by another form
        if response:
            if len(response) == 1 and (response[0].get("_id") != mapper.form_id):
                raise BusinessException(BusinessErrorCode.FORM_EXISTS)
        return True

    def update_workflow(self, xml_data, process_name):
        """Parse the workflow XML data & update process name."""
        current_app.logger.info("Updating workflow...")
        root = ProcessService.xml_parser(xml_data)

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

    @user_context
    def save_process_data(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self,
        workflow_data,
        name,
        selected_workflow_version=None,
        is_new=False,
        process_type=ProcessType.BPMN.value,
        **kwargs,
    ):
        """Save process data."""
        current_app.logger.info("Saving process data...")
        user: UserContext = kwargs["user"]
        updated_xml = (
            self.update_workflow(workflow_data, name)
            if process_type == ProcessType.BPMN.value
            else json.dumps(workflow_data)
        )
        # Save workflow on new import will have major version as 1 and minor version as 0
        major_version, minor_version = 1, 0
        if not is_new:
            # Save workflow on edit import
            current_app.logger.info(
                f"Capturing version for process {name} in edit import..."
            )
            if selected_workflow_version:
                major_version, minor_version, _, _ = self.get_latest_version_workflow(
                    name
                )
                if selected_workflow_version == "major":
                    major_version += 1
                    minor_version = 0
                else:
                    minor_version += 1
            else:
                # If selected workflow version not specified
                # Then update version as major if latest process data is published
                # Otherwise update version as minor
                major_version, minor_version = self.determine_process_version_by_key(
                    name
                )
        # Save workflow as draft
        process_data = updated_xml.encode("utf-8")
        process = Process(
            name=name,
            process_type=process_type,
            tenant=user.tenant_key,
            process_data=process_data,
            created_by=user.user_name,
            major_version=major_version,
            minor_version=minor_version,
            process_key=name,
            parent_process_key=name,
        )
        process.save()
        current_app.logger.info("Process data saved successfully...")
        return process

    def version_response(self, form_major, form_minor, workflow_major, workflow_minor):
        """Version response."""
        return {
            "form": {
                "majorVersion": form_major,
                "minorVersion": form_minor,
            },
            "workflow": {
                "majorVersion": workflow_major,
                "minorVersion": workflow_minor,
            },
        }

    def import_new_form_workflow(
        self, file_data, form_json, workflow_data, process_type
    ):
        """Import new form+workflow."""
        anonymous = file_data.get("forms")[0].get("anonymous") or False
        form_json = self.set_form_and_submission_access(form_json, anonymous)
        form_json.pop("parentFormId", None)
        form_response = self.form_create(form_json)
        form_id = form_response.get("_id")
        FormHistoryService.create_form_log_with_clone(
            data={
                **form_response,
                "parentFormId": form_id,
                "newVersion": True,
                "componentChanged": True,
            }
        )
        process_name = form_response.get("name")
        # process key/Id doesn't support numbers & special characters at start
        # special characters anywhere so clean them before setting as process key
        process_name = ProcessService.clean_form_name(process_name)
        mapper_data = {
            "form_id": form_id,
            "form_name": form_response.get("title"),
            "form_type": form_response.get("type"),
            "parent_form_id": form_id,
            "is_anonymous": file_data.get("forms")[0].get("anonymous") or False,
            "task_variable": json.dumps(default_task_variables),
            "process_key": process_name,
            "process_name": process_name,
            "status": "inactive",
            "description": file_data.get("forms")[0].get("formDescription") or "",
        }
        mapper = FormProcessMapperService.create_mapper(mapper_data)
        form_logs_data = {
            "titleChanged": True,
            "formName": form_response.get("title"),
            "formTypeChanged": True,
            "formType": form_response.get("type"),
            "anonymousChanged": True,
            "anonymous": file_data.get("forms")[0].get("anonymous") or False,
            "formId": form_id,
            "parentFormId": form_id,
        }
        FormHistoryService.create_form_logs_without_clone(data=form_logs_data)
        # Update the form_id in the data dictionary with the new form_id
        for auth in file_data["authorizations"][0]:
            file_data["authorizations"][0][auth]["resourceId"] = form_id
        # Create authorizations for the form
        self.create_authorization(file_data["authorizations"][0], new_import=True)
        # validate process key already exists, if exists append mapper id to process_key.
        updated_process_name = (
            FormProcessMapperService.validate_process_and_update_mapper(
                process_name, mapper
            )
        )
        process_name = updated_process_name if updated_process_name else process_name
        current_app.logger.info(f"Process Name: {process_name}")
        process = self.save_process_data(
            workflow_data, process_name, is_new=True, process_type=process_type
        )
        return mapper, process

    def import_form(
        self, selected_form_version, form_json, mapper, form_only=False, **kwargs
    ):  # pylint: disable=too-many-locals, too-many-statements
        """Import form as major or minor version."""
        current_app.logger.info("Form import inprogress...")
        # Get current form by mapper form_id
        current_form = self.get_form_by_formid(mapper.form_id)
        name = current_form.get("name")
        title_changed = bool(
            not form_only and mapper.form_name != form_json.get("title")
        )
        if form_only:
            # In case of form only import take title, path from current form
            # and anonymous, description from mapper
            path = current_form.get("path")
            title = current_form.get("title")
            anonymous = mapper.is_anonymous
            description = mapper.description
        else:
            # form+workflow import take title, path, anonymous, description from incoming form json
            path = form_json.get("path")
            title = form_json.get("title")
            anonymous = kwargs.get("anonymous", False)
            description = kwargs.get("description", None)
        anonymous_changed = bool(
            anonymous is not None and mapper.is_anonymous != anonymous
        )

        if selected_form_version == "major":
            # Update current form with random value to path, name & title
            # Create new form with current form name, title & path from incoming form
            # Create mapper entry for new form version, mark previous version inactive & delete
            # Capture form history
            current_app.logger.info("Form import major version inprogress...")
            # Update name & path of current form
            current_form["path"] = f"{current_form['path']}-v-{uuid1().hex}"
            current_form["name"] = f"{name}-v-{uuid1().hex}"
            FormProcessMapperService.form_design_update(current_form, mapper.form_id)
            # Create new form with current form name
            # But incase of form only no validation done, so use current form path & title itself.
            form_json["title"] = title
            form_json["path"] = path
            form_json["parentFormId"] = mapper.parent_form_id
            form_json = self.set_form_and_submission_access(form_json, anonymous)
            form_response = self.form_create(form_json)
            form_id = form_response.get("_id")
            FormHistoryService.create_form_log_with_clone(
                data={
                    **form_response,
                    "parentFormId": mapper.parent_form_id,
                    "newVersion": True,
                    "componentChanged": True,
                }
            )
            mapper_data = {
                "formId": form_id,
                "previousFormId": mapper.form_id,
                "formName": form_response.get("title"),
                "formType": mapper.form_type,
                "parentFormId": mapper.parent_form_id,
                "anonymous": anonymous,
                "taskVariables": json.loads(mapper.task_variable),
                "processKey": mapper.process_key,
                "processName": mapper.process_name,
                "status": mapper.status,
                "id": str(mapper.id),
                "formTypeChanged": False,
                "titleChanged": title_changed,
                "anonymousChanged": anonymous_changed,
                "description": description,
                "isMigrated": mapper.is_migrated,
            }
            mapper = FormProcessMapperService.mapper_create(mapper_data)
            FormProcessMapperService.mark_unpublished(mapper.id)
        else:
            current_app.logger.info("Form import minor version inprogress...")
            form_id = mapper.form_id
            FormProcessMapperService.check_tenant_authorization_by_formid(
                form_id=form_id
            )
            # Minor version update form components in formio & create form history.
            form_components = {}
            form_components["components"] = form_json.get("components")
            # Incase of form+workflow title/path is updated even in minor version
            form_components["title"] = title
            form_components["path"] = path
            form_components["parentFormId"] = mapper.parent_form_id
            form_response = self.form_update(form_components, form_id)
            form_response["componentChanged"] = True
            form_response["parentFormId"] = mapper.parent_form_id
            FormHistoryService.create_form_log_with_clone(data=form_response)
            if not form_only:
                # Update description, anonymous & status in mapper if form+workflow import
                current_app.logger.info("Updating mapper & form logs...")
                mapper.description = description
                mapper.is_anonymous = anonymous
                mapper.form_name = title
                mapper.save()
                form_logs_data = {
                    "titleChanged": title_changed,
                    "formName": title,
                    "anonymousChanged": anonymous_changed,
                    "anonymous": anonymous,
                    "formId": form_id,
                    "parentFormId": mapper.parent_form_id,
                }
                FormHistoryService.create_form_logs_without_clone(data=form_logs_data)
        return mapper

    def import_edit_form(self, file_data, selected_form_version, form_json, mapper):
        """Import edit form."""
        current_app.logger.info("Form import with form+workflow json inprogress...")
        anonymous = file_data.get("forms")[0].get("anonymous") or False
        description = file_data.get("forms")[0].get("formDescription", "")
        mapper = self.import_form(
            selected_form_version,
            form_json,
            mapper,
            anonymous=anonymous,
            description=description,
        )
        # Update authorizations with incoming form authorizations
        # resourceId(formId) differ in incoming import form+workflow json
        # Use parent_form_id from mapper & auth details from incoming data
        for auth in file_data["authorizations"][0]:
            file_data["authorizations"][0][auth]["resourceId"] = mapper.parent_form_id
        # Update authorizations for the form
        self.create_authorization(file_data["authorizations"][0])
        return mapper

    @user_context
    def import_form_workflow(
        self, request, **kwargs
    ):  # pylint: disable=too-many-locals, too-many-statements, too-many-branches
        """Import form/workflow."""
        current_app.logger.info("Processing import data...")
        request_data, file = self.validate_input_data(request)
        schema = ImportRequestSchema()
        input_data = schema.load(request_data)
        import_type = input_data.get("import_type")
        action = input_data.get("action")
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = None
        process = None
        response = {}

        # Check if the action is valid
        if action not in ["validate", "import"]:
            raise BusinessException(BusinessErrorCode.INVALID_INPUT)

        if import_type == "new":  # pylint: disable=too-many-nested-blocks
            current_app.logger.info("Import new processing..")
            # Validate input file type whether it is json
            if not self.validate_file_type(file.filename, (".json",)):
                raise BusinessException(BusinessErrorCode.INVALID_FILE_TYPE)
            current_app.logger.info("Valid json file type.")
            file_data = self.read_json_data(file)
            # Vaidate file data
            valid_input_json = self.validate_input_json(file_data, form_workflow_schema)
            if not valid_input_json:
                raise BusinessException(BusinessErrorCode.INVALID_FILE_TYPE)
            form_json = file_data.get("forms")[0].get("content")
            workflow_data, process_type = self.get_process_details(file_data)
            validate_form_response = self.validate_form(form_json, tenant_key)
            if validate_form_response:
                raise BusinessException(BusinessErrorCode.FORM_EXISTS)
            if action == "validate":
                # On Import new, version will be 1.0
                return self.version_response(
                    form_major=1, form_minor=0, workflow_major=1, workflow_minor=0
                )
            if action == "import":
                if current_app.config.get("MULTI_TENANCY_ENABLED"):
                    form_json = self.append_tenant_key_form_name_path(
                        form_json, tenant_key
                    )
                mapper, process = self.import_new_form_workflow(
                    file_data, form_json, workflow_data, process_type
                )
        else:
            current_app.logger.info("Import edit processing..")
            edit_request = ImportEditRequestSchema().load(request_data)
            valid_file = self.validate_file_type(file.filename, (".json", ".bpmn"))
            mapper_id = edit_request.get("mapper_id")
            # mapper is required for edit. Add validation
            mapper = FormProcessMapperService().validate_mapper(mapper_id, tenant_key)

            if mapper.status == FormProcessMapperStatus.ACTIVE.value:
                # Raise an exception if the user try to update published form
                raise BusinessException(BusinessErrorCode.FORM_INVALID_OPERATION)
            if valid_file == ".json":
                file_data = self.read_json_data(file)
                # Validate input json file whether only form or form+workflow
                if self.validate_input_json(file_data, form_schema):
                    current_app.logger.info("Form only import inprogress...")
                    form_json = file_data.get("forms")[0]
                    form_major, form_minor = self.get_latest_version_form(
                        mapper.parent_form_id
                    )
                    # No need to validate form exists
                    # Incoming form data need to be updated as either major or minor version
                    if action == "validate":
                        return self.version_response(
                            form_major=form_major,
                            form_minor=form_minor,
                            workflow_major=None,
                            workflow_minor=None,
                        )
                    if action == "import":
                        selected_form_version = edit_request.get("form", {}).get(
                            "selectedVersion"
                        )
                        mapper = self.import_form(
                            selected_form_version, form_json, mapper, form_only=True
                        )
                elif self.validate_input_json(file_data, form_workflow_schema):
                    current_app.logger.info("Form and workflow import inprogress...")
                    form_json = file_data.get("forms")[0].get("content")
                    # Validate form exists
                    self.validate_edit_form_exists(form_json, mapper, tenant_key)
                    if action == "validate":
                        major, minor = self.determine_process_version_by_key(
                            mapper.process_key
                        )
                        form_major, form_minor = self.get_latest_version_form(
                            mapper.parent_form_id
                        )
                        return self.version_response(
                            form_major=form_major,
                            form_minor=form_minor,
                            workflow_major=major,
                            workflow_minor=minor,
                        )
                    if action == "import":
                        skip_form = edit_request.get("form", {}).get("skip", True)
                        skip_workflow = edit_request.get("workflow", {}).get(
                            "skip", True
                        )
                        # selected version of form and workflow: major/minor
                        selected_form_version = edit_request.get("form", {}).get(
                            "selectedVersion"
                        )
                        selected_workflow_version = edit_request.get(
                            "workflow", {}
                        ).get("selectedVersion")
                        # If skipform/skip workflow is none or true then skip
                        # If selected version(major/minor) not provided then use minor in case of form
                        # major/minor based on workflow published/draft

                        if not skip_form:
                            # Import form
                            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                                form_json = self.append_tenant_key_form_name_path(
                                    form_json, tenant_key
                                )
                            mapper = self.import_edit_form(
                                file_data, selected_form_version, form_json, mapper
                            )
                        if not skip_workflow:
                            # import workflow
                            current_app.logger.info("Workflow import inprogress...")
                            workflow_data, process_type = self.get_process_details(
                                file_data
                            )
                            process = self.save_process_data(
                                workflow_data,
                                mapper.process_key,
                                selected_workflow_version,
                                process_type=process_type,
                            )

                else:
                    raise BusinessException(BusinessErrorCode.INVALID_FILE_TYPE)
            elif valid_file == ".bpmn":
                current_app.logger.info("Workflow validated successfully.")
                if action == "validate":
                    major, minor = self.determine_process_version_by_key(
                        mapper.process_key
                    )
                    return self.version_response(
                        form_major=None,
                        form_minor=None,
                        workflow_major=major,
                        workflow_minor=minor,
                    )
                if action == "import":
                    selected_workflow_version = edit_request.get("workflow", {}).get(
                        "selectedVersion"
                    )
                    file_content = file.read().decode("utf-8")
                    process = self.save_process_data(
                        file_content,
                        mapper.process_key,
                        selected_workflow_version,
                    )
        if mapper:
            response["mapper"] = FormProcessMapperSchema().dump(mapper)
        if process:
            response["process"] = ProcessDataSchema().dump(process)
        return response

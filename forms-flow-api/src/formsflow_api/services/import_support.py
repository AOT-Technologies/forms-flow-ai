"""This exposes Import service."""

import json
from uuid import uuid1

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.user_context import UserContext, user_context
from jsonschema import ValidationError, validate
from lxml import etree

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import (
    AuthType,
    FormHistory,
    FormProcessMapper,
    Process,
    ProcessStatus,
)
from formsflow_api.schemas import (
    ImportEditRequestSchema,
    ImportRequestSchema,
    form_schema,
    form_workflow_schema,
)

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

    def create_authorization(self, data):
        """Create authorization."""
        for auth_type in AuthType:
            if auth_type.value in [
                AuthType.APPLICATION.value,
                AuthType.FORM.value,
                AuthType.DESIGNER.value,
            ]:
                self.auth_service.create_authorization(
                    auth_type.value.upper(),
                    data.get(auth_type.value.upper()),
                    is_designer=True,
                )

    def get_latest_version_workflow(self, process_name, include_status=False):
        """Get latest version of workflow by process name."""
        process = Process.get_latest_version(process_name)
        # If process not found, consider as initial version
        if not process:
            return (1, 0, None) if include_status else (1, 0)
        if include_status:
            return process.major_version, process.minor_version, process.status
        return process.major_version, process.minor_version

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

    def validate_form_exists(self, form_json, tenant_key, validate_path_only=False):
        """Validate form already exists."""
        title = form_json.get("title")
        name = form_json.get("name")
        path = form_json.get("path")
        # Add 'tenantkey-' from 'path' and 'name'
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            if not validate_path_only:
                name = f"{tenant_key}-name"
            path = f"{tenant_key}-path"

        # Build query params based on validation type
        if validate_path_only:
            query_params = f"path={path}&select=title,path,name,_id"
        else:
            query_params = (
                f"title={title}&name={name}&path={path}&select=title,path,name"
            )
        current_app.logger.info(f"Validating form exists...{query_params}")
        response = self.get_form_by_query(query_params)
        return response

    def validate_form_title(self, form_json, mapper):
        """Validate form tile in the form_process_mapper table."""
        # Exclude the current mapper from the query
        current_app.logger.info(f"Validation for form title...{form_json.get('title')}")
        mappers = FormProcessMapper.find_forms_by_title(
            form_json.get("title"), exclude_id=mapper.id
        )
        if mappers:
            current_app.logger.debug(f"Other mappers matching the title- {mappers}")
            raise BusinessException(BusinessErrorCode.FORM_EXISTS)
        return True

    def validate_edit_form_exists(self, form_json, mapper, tenant_key):
        """Validate form exists on edit import."""
        current_app.logger.info("Validating form exists in import edit...")
        # Validate title in mapper table.
        self.validate_form_title(form_json, mapper)
        # Validate path exists in formio.
        response = self.validate_form_exists(
            form_json, tenant_key, validate_path_only=True
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
        # pylint: disable=I1101
        root = etree.fromstring(xml_data.encode("utf-8"))

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

    def save_process_data(  # pylint: disable=too-many-arguments
        self,
        workflow_data,
        name,
        mapper_id,
        selected_workflow_version=None,
        is_new=False,
    ):
        """Save process data."""
        current_app.logger.info("Saving process data...")
        updated_xml = self.update_workflow(workflow_data, name)
        # Save workflow on new import will have major version as 1 and minor version as 0
        major_version, minor_version = 1, 0
        if not is_new:
            # Save workflow on edit import
            current_app.logger.info(
                f"Capturing version for process {name} in edit import..."
            )
            if selected_workflow_version:
                major_version, minor_version = self.get_latest_version_workflow(name)
                if selected_workflow_version == "major":
                    major_version += 1
                    minor_version = 0
                else:
                    minor_version += 1
            else:
                # If selected workflow version not specified
                # Then update version as major if latest process data is published
                # Otherwise update version as minor
                major_version, minor_version, status = self.get_latest_version_workflow(
                    name, include_status=True
                )
                if status and status == ProcessStatus.PUBLISHED:
                    major_version += 1
                    minor_version = 0
                else:
                    minor_version += 1
        # Save workflow as draft
        process_data = {
            "status": "Draft",
            "processType": "bpmn",
            "name": name,
            "processData": updated_xml,
            "majorVersion": major_version,
            "minorVersion": minor_version,
            "formProcessMapperId": mapper_id,
        }
        ProcessService.create_process(payload=process_data)
        current_app.logger.info("rocess data saved successfully...")

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

    def import_new_form_workflow(self, file_data, form_json, workflow_data):
        """Import new form+workflow."""
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
        mapper_data = {
            "form_id": form_id,
            "form_name": form_response.get("title"),
            "form_type": form_response.get("type"),
            "parent_form_id": form_id,
            "is_anonymous": file_data.get("forms")[0].get("anonymous") or False,
            "task_variable": "[]",
            "process_key": form_response.get("name"),
            "process_name": form_response.get("name"),
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
        self.create_authorization(file_data["authorizations"][0])
        self.save_process_data(
            workflow_data, form_response.get("name"), mapper_id=mapper.id, is_new=True
        )

    def import_form(
        self, selected_form_version, form_json, mapper, form_only=False, **kwargs
    ):  # pylint: disable=too-many-locals
        """Import form as major or minor version."""
        current_app.logger.info("Form import inprogress...")
        # Get current form by mapper form_id
        current_form = self.get_form_by_formid(mapper.form_id)
        new_path = form_json.get("path")
        new_title = form_json.get("title")
        anonymous = kwargs.get("anonymous", None)
        description = kwargs.get("description", None)
        title_changed = bool(not form_only and mapper.form_name != new_title)
        anonymous_changed = bool(
            anonymous is not None and mapper.is_anonymous != anonymous
        )
        if selected_form_version == "major":
            # Update current form with random value to path, name & title
            # Create new form with current form name, title & path from incoming form
            # Create mapper entry for new form version, mark previous version inactive & delete
            # Capture form history
            current_app.logger.info("Form import major version inprogress...")
            path = current_form.get("path")
            name = current_form.get("name")
            title = current_form.get("title")
            # Update name & path of current form
            current_form["path"] = f"{path}-v-{uuid1().hex}"
            current_form["name"] = f"{name}-v-{uuid1().hex}"
            current_form["title"] = f"{title}-v-{uuid1().hex}"
            FormProcessMapperService.form_design_update(current_form, mapper.form_id)
            # Create new form with current form name
            form_json["parentFormId"] = mapper.parent_form_id
            form_json["name"] = name
            # Update path of current form with pathname & title from imported form in case of edit import
            # But incase of form only no validation done, so use current form path & title itself.
            form_json["title"] = title if form_only else new_title
            form_json["path"] = path if form_only else new_path
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
                "anonymous": mapper.is_anonymous if form_only else anonymous,
                "taskVariable": json.loads(mapper.task_variable),
                "processKey": form_response.get("name"),
                "processName": form_response.get("name"),
                "version": str(mapper.version + 1),
                "status": mapper.status,
                "id": str(mapper.id),
                "formTypeChanged": False,
                "titleChanged": title_changed,
                "anonymousChanged": anonymous_changed,
                "description": mapper.description if form_only else description,
            }
            FormProcessMapperService.mapper_create(mapper_data)
            FormProcessMapperService.mark_inactive_and_delete(mapper.id)
        else:
            current_app.logger.info("Form import minor version inprogress...")
            FormProcessMapperService.check_tenant_authorization_by_formid(
                form_id=mapper.form_id
            )
            # Minor version update form components in formio & create form history.
            form_components = {}
            form_components["components"] = form_json.get("components")
            form_response = self.form_update(form_components, mapper.form_id)
            form_response["componentChanged"] = True
            form_response["parentFormId"] = mapper.parent_form_id
            FormHistoryService.create_form_log_with_clone(data=form_response)
            if not form_only:
                # Update description, anonymous & status in mapper if form+workflow import
                current_app.logger.info("Updating mapper & form logs...")
                mapper.description = description
                mapper.is_anonymous = anonymous
                mapper.save()
                form_logs_data = {
                    "titleChanged": title_changed,
                    "formName": new_title,
                    "anonymousChanged": anonymous_changed,
                    "anonymous": anonymous,
                    "formId": mapper.form_id,
                    "parentFormId": mapper.parent_form_id,
                }
                FormHistoryService.create_form_logs_without_clone(data=form_logs_data)

    def import_edit_form(self, file_data, selected_form_version, form_json, mapper):
        """Import edit form."""
        current_app.logger.info("Form import with form+workflow json inprogress...")
        anonymous = file_data.get("forms")[0].get("anonymous")
        description = file_data.get("forms")[0].get("formDescription", "")
        self.import_form(
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

    def find_mapper(self, mapper_id, tenant_key=None):
        """Find mapper."""
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id=mapper_id)
        if not mapper:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)
        if mapper and tenant_key is not None and mapper.tenant != tenant_key:
            raise PermissionError(BusinessErrorCode.PERMISSION_DENIED)
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

        # Check if the action is valid
        if action not in ["validate", "import"]:
            raise BusinessException(BusinessErrorCode.INVALID_INPUT)

        if import_type == "new":
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
            workflow_data = file_data.get("workflows")[0].get("content")
            validate_form_response = self.validate_form_exists(form_json, tenant_key)
            if validate_form_response:
                raise BusinessException(BusinessErrorCode.FORM_EXISTS)
            if action == "validate":
                # On Import new, version will be 1.0
                return self.version_response(
                    form_major=1, form_minor=0, workflow_major=1, workflow_minor=0
                )
            if action == "import":
                self.import_new_form_workflow(file_data, form_json, workflow_data)
        else:
            current_app.logger.info("Import edit processing..")
            edit_request = ImportEditRequestSchema().load(request_data)
            valid_file = self.validate_file_type(file.filename, (".json", ".bpmn"))
            mapper_id = edit_request.get("mapper_id")
            # mapper is required for edit. Add validation
            mapper = self.find_mapper(mapper_id, tenant_key)
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
                            form_major=form_major + 1,
                            form_minor=form_minor + 1,
                            workflow_major=None,
                            workflow_minor=None,
                        )
                    if action == "import":
                        selected_form_version = edit_request.get("form", {}).get(
                            "selectedVersion"
                        )
                        self.import_form(
                            selected_form_version, form_json, mapper, form_only=True
                        )
                elif self.validate_input_json(file_data, form_workflow_schema):
                    current_app.logger.info("Form and workflow import inprogress...")
                    form_json = file_data.get("forms")[0].get("content")
                    # Validate form exists
                    self.validate_edit_form_exists(form_json, mapper, tenant_key)
                    if action == "validate":
                        major, minor = self.get_latest_version_workflow(
                            mapper.process_key
                        )
                        form_major, form_minor = self.get_latest_version_form(
                            mapper.parent_form_id
                        )
                        return self.version_response(
                            form_major=form_major + 1,
                            form_minor=form_minor + 1,
                            workflow_major=major + 1,
                            workflow_minor=minor + 1,
                        )
                    if action == "import":
                        skip_form = edit_request.get("form", {}).get("skip")
                        skip_workflow = edit_request.get("workflow", {}).get("skip")
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
                            self.import_edit_form(
                                file_data, selected_form_version, form_json, mapper
                            )
                        if not skip_workflow:
                            # import workflow
                            current_app.logger.info("Workflow import inprogress...")
                            workflow_data = file_data.get("workflows")[0].get("content")
                            self.save_process_data(
                                workflow_data,
                                mapper.process_key,
                                mapper.id,
                                selected_workflow_version,
                            )

                else:
                    raise BusinessException(BusinessErrorCode.INVALID_FILE_TYPE)
            elif valid_file == ".bpmn":
                current_app.logger.info("Workflow validated successfully.")
                if action == "validate":
                    major, minor = self.get_latest_version_workflow(mapper.process_key)
                    return self.version_response(
                        form_major=None,
                        form_minor=None,
                        workflow_major=major + 1,
                        workflow_minor=minor + 1,
                    )
                if action == "import":
                    selected_workflow_version = edit_request.get("workflow", {}).get(
                        "selectedVersion"
                    )
                    file_content = file.read().decode("utf-8")
                    self.save_process_data(
                        file_content,
                        mapper.process_key,
                        mapper_id,
                        selected_workflow_version,
                    )
        return {"message": "Imported successfully."}

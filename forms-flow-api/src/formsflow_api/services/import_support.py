"""This exposes Import service."""

import json

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.user_context import UserContext, user_context
from jsonschema import ValidationError, validate
from lxml import etree

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import AuthType, FormProcessMapper, Process
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


class ImportService:
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

    def get_latest_version_workflow(self, process_name):
        """Get latest version of workflow by process name."""
        process = Process.get_latest_version(process_name)
        if not process:
            raise BusinessException(BusinessErrorCode.PROCESS_ID_NOT_FOUND)
        return process.major_version, process.minor_version

    def form_create(self, data):
        """Create form in formio."""
        return self.formio.create_form(data, self.__get_formio_access_token())

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

    def valide_form_exists(self, form_json, tenant_key):
        """Validate form already exists."""
        title = form_json.get("title")
        name = form_json.get("name")
        path = form_json.get("path")
        # Add 'tenantkey-' from 'path' and 'name'
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            name = f"{tenant_key}-name"
            path = f"{tenant_key}-path"
        query_params = f"title={title}&name={name}&path={path}&select=title,path,name"
        current_app.logger.info(f"Validating form exists...{query_params}")
        response = self.formio.get_form_search(
            query_params, self.__get_formio_access_token()
        )
        if response:
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

        if is_new:
            major_version, minor_version = 1, 0
        else:
            major_version, minor_version = self.get_latest_version_workflow(name)
            if selected_workflow_version and selected_workflow_version == "major":
                major_version += 1
                minor_version = 0
            if selected_workflow_version and selected_workflow_version == "minor":
                minor_version += 1
            # TODO if selected version not specified then update version based on draft/publish # pylint: disable=fixme
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
        }
        mapper = FormProcessMapperService.create_mapper(mapper_data)
        form_logs_data = {
            "titleChanged": True,
            "formName": form_response.get("title"),
            "formTypeChanged": True,
            "formType": form_response.get("type"),
            "anonymousChanged": True,
            "anonymous": False,
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
            self.valide_form_exists(form_json, tenant_key)
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

            if valid_file == ".json":
                file_data = self.read_json_data(file)
                # Validate input json file whether only form or form+workflow
                if self.validate_input_json(file_data, form_schema):
                    current_app.logger.info("Form only import inprogress...")
                    # TODO Only form import # pylint: disable=fixme
                    return self.version_response(
                        form_major=1,
                        form_minor=0,
                        workflow_major=None,
                        workflow_minor=None,
                    )
                if self.validate_input_json(file_data, form_workflow_schema):
                    current_app.logger.info("Form and workflow import inprogress...")
                    mapper = self.find_mapper(mapper_id, tenant_key)
                    if action == "validate":
                        major, minor = self.get_latest_version_workflow(
                            mapper.process_key
                        )
                        # TODO Get latest form version # pylint: disable=fixme
                        return self.version_response(
                            form_major=1,
                            form_minor=0,
                            workflow_major=major + 1,
                            workflow_minor=minor + 1,
                        )
                    if action == "import":
                        skip_form = edit_request.get("forms", {}).get("skip")
                        skip_workflow = edit_request.get("workflows", {}).get("skip")
                        # selected version of form and workflow: major/minor
                        # selected_form_version = edit_request.get("forms", {}).get("selectedVersion")
                        selected_workflow_version = edit_request.get(
                            "workflows", {}
                        ).get("selectedVersion")
                        if not skip_form:
                            form_json = file_data.get("forms")[0].get("content")
                            # TODO form import # pylint: disable=fixme
                        if not skip_workflow:
                            # import workflow
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
                mapper = self.find_mapper(mapper_id, tenant_key)
                if action == "validate":
                    major, minor = self.get_latest_version_workflow(mapper.process_key)
                    return self.version_response(
                        form_major=None,
                        form_minor=None,
                        workflow_major=major + 1,
                        workflow_minor=minor + 1,
                    )
                if action == "import":
                    selected_workflow_version = edit_request.get("workflows", {}).get(
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

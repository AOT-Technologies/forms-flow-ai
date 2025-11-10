"""This exposes tasks service."""

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models.application import Application
from formsflow_api.models.tasks import TaskOutcomeConfiguration
from formsflow_api.schemas.tasks import (
    TaskCompletionSchema,
    TaskOutcomeConfigurationSchema,
)
from formsflow_api.services.external import BPMService

from .application_history import ApplicationHistoryService

task_outcome_schema = TaskOutcomeConfigurationSchema()


class TaskService:
    """This class manages task service."""

    def __init__(self) -> None:
        """Initialize."""
        self.formio = FormioService()

    @user_context
    def create_task_outcome_configuration(
        self, request_data: dict, **kwargs
    ) -> TaskOutcomeConfiguration | None:
        """Create new task outcome."""
        current_app.logger.info("Creating task outcome configuration")
        user: UserContext = kwargs["user"]
        data = task_outcome_schema.load(request_data)
        task_outcome_config = (
            TaskOutcomeConfiguration.get_task_outcome_configuration_by_task_id(
                data["task_id"], user.tenant_key
            )
        )
        if task_outcome_config:
            current_app.logger.info("Task outcome configuration already exists")
            task_outcome_config.task_name = data["task_name"]
            task_outcome_config.task_transition_map = data["task_transition_map"]
            task_outcome_config.transition_map_type = data["transition_map_type"]
        else:
            task_outcome_config = TaskOutcomeConfiguration(
                task_id=data["task_id"],
                task_name=data["task_name"],
                task_transition_map=data["task_transition_map"],
                transition_map_type=data["transition_map_type"],
                created_by=user.user_name,
                tenant=user.tenant_key,
            )
        task_outcome_config.save()
        current_app.logger.info("Task outcome configuration created successfully")
        response = task_outcome_schema.dump(task_outcome_config)
        return response

    @user_context
    def get_task_outcome_configuration(
        self, task_id: str, **kwargs
    ) -> TaskOutcomeConfiguration | None:
        """Get task outcome configuration by task ID."""
        current_app.logger.info(
            f"Getting task outcome configuration for task ID {task_id}"
        )
        user: UserContext = kwargs["user"]
        task_outcome = (
            TaskOutcomeConfiguration.get_task_outcome_configuration_by_task_id(
                task_id, user.tenant_key
            )
        )
        if task_outcome:
            response = task_outcome_schema.dump(task_outcome)
            return response
        raise BusinessException(BusinessErrorCode.TASK_OUTCOME_NOT_FOUND)

    def form_submission(self, form_id: str, data: dict):
        """Create form submission in formio."""
        current_app.logger.debug("Formio new submission started...")
        submission_data = {"data": data["form_data"].get("data")}
        form_io_token = self.formio.get_formio_access_token()
        formio_response = self.formio.create_submission(
            form_id, submission_data, form_io_token
        )
        current_app.logger.debug("Formio new submission completed...")
        return formio_response

    def update_application(self, application_id: int, data: dict, user: UserContext):
        """Update application details."""
        application = Application.find_by_id(application_id=application_id)
        if application is None and user.tenant_key is not None:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        # This can be used later if workflow completion fails and we need to rollback
        application_backup_data = {
            "application_status": application.application_status,
            "submission_id": application.submission_id,
            "latest_form_id": application.latest_form_id,
        }
        data["modified_by"] = user.user_name
        application.update(data)
        application.commit()
        current_app.logger.debug("Application details updated...")
        return application, application_backup_data

    @user_context
    def complete_task(
        self, task_id, request_data, **kwargs
    ):  # pylint:disable=too-many-locals
        """Complete a Camunda task and persist audit/application updates."""
        data = TaskCompletionSchema().load(request_data)
        user: UserContext = kwargs["user"]
        token = user.bearer_token

        form_id = data["form_data"].get("form_id")
        # Create form submission in fomrio
        formio_response = self.form_submission(form_id, data)
        submission_id = formio_response.get("_id")
        form_url = self.formio.base_url + f"/form/{form_id}/submission/{submission_id}"

        # Update task completion details in application audit table
        application_id = data["application_data"].get("application_id")
        data["application_data"]["form_url"] = form_url

        application_audit_entry = ApplicationHistoryService.create_application_history(
            data["application_data"], application_id
        )
        current_app.logger.debug("Application audit captured...")

        # Update application status, form_id and submission_id in application table
        application_update_data = {
            "application_status": data["application_data"].get("application_status"),
            "submission_id": submission_id,
            "latest_form_id": form_id,
        }
        application, application_backup_data = self.update_application(
            application_id, application_update_data, user
        )

        try:
            # Complete task in workflow
            # Fetch data from request_data and modify formUrl and webFormUrl values
            # Since schema returns camel_case, data directly fetched from request_data
            variables = request_data["bpmnData"]["variables"]
            variables["formUrl"]["value"] = form_url
            web_form_url = variables["webFormUrl"]["value"]
            variables["webFormUrl"][
                "value"
            ] = f"{web_form_url.rsplit('/', 1)[0]}/{submission_id}"
            BPMService.complete_task(task_id, request_data["bpmnData"], token)
            current_app.logger.debug("Workflow task completed...")
        except Exception as exception:
            # If workflow task completion fails, rollback the application update and audit entry
            current_app.logger.error(
                f"Error completing workflow task: {str(exception)}. Initiating rollback..."
            )
            # Rollback application details
            application.update(application_backup_data)
            application.commit()
            current_app.logger.debug("Application details rolled back...")
            # Rollback application audit entry
            application_audit_entry.delete()
            current_app.logger.debug("Application audit entry rolled back...")
            raise BusinessException(
                BusinessErrorCode.WORKFLOW_TASK_COMPLETION_FAILED
            ) from exception

        return {"message": "Task completed successfully"}

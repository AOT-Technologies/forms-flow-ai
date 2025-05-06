"""This exposes tasks service."""

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models.tasks import TaskOutcomeConfiguration
from formsflow_api.schemas.tasks import TaskOutcomeConfigurationSchema

task_outcome_schema = TaskOutcomeConfigurationSchema()


class TaskService:
    """This class manages task service."""

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

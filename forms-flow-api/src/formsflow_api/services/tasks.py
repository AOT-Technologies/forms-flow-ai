"""This exposes tasks service."""

from flask import current_app
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models.tasks import TaskOutcomeConfiguration
from formsflow_api.schemas.tasks import TaskOutcomeSchema

task_outcome_schema = TaskOutcomeSchema()


class TaskService:
    """This class manages task service."""

    @user_context
    def create_task_outcome(
        self, request_data: dict, **kwargs
    ) -> TaskOutcomeConfiguration | None:
        """Create new task outcome."""
        current_app.logger.info("Creating task outcome configuration")
        user: UserContext = kwargs["user"]
        data = task_outcome_schema.load(request_data)
        task_outcome = TaskOutcomeConfiguration.get_task_outcome_by_task_id(
            data["task_id"], user.tenant_key
        )
        if task_outcome:
            current_app.logger.info("Task outcome configuration already exists")
            task_outcome.task_outcome = data["task_outcome"]
        else:
            task_outcome = TaskOutcomeConfiguration(
                task_id=data["task_id"],
                task_outcome=data["task_outcome"],
                created_by=user.user_name,
                tenant=user.tenant_key,
            )
        task_outcome.save()
        current_app.logger.info("Task outcome configuration created successfully")
        response = task_outcome_schema.dump(task_outcome)
        return response

    @user_context
    def get_task_outcome(
        self, task_id: str, **kwargs
    ) -> TaskOutcomeConfiguration | None:
        """Get task outcome configuration by task ID."""
        current_app.logger.info(
            "Getting task outcome configuration for task ID {task_id}"
        )
        user: UserContext = kwargs["user"]
        task_outcome = TaskOutcomeConfiguration.get_task_outcome_by_task_id(
            task_id, user.tenant_key
        )
        if task_outcome:
            response = task_outcome_schema.dump(task_outcome)
            return response
        return None

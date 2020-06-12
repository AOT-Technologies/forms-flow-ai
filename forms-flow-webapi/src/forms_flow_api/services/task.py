"""This exposes task service."""
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import TaskListSchema
from .external import BPMService


class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        """Get all tasks."""
        task = BPMService.get_all_tasks()
        if task:
            return TaskListSchema().dump(task)

        return task

    @staticmethod
    def get_task(task_id):
        """Get task details."""
        task_details = BPMService.get_task_details(task_id)
        if task_details:
            return TaskListSchema().dump(task_details)

        raise BusinessException('Invalid task', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def claim_task(task_id):
        """Claim a task."""
        task_claim = BPMService.claim_task(task_id)
        return 'success' if task_claim else 'error'

    @staticmethod
    def unclaim_task(task_id):
        """Unclaim a task."""
        task_unclaim = BPMService.unclaim_task(task_id)
        return 'success' if task_unclaim else 'error'

    @staticmethod
    def set_action_task(task_id):
        """Set an action for a task."""
        task_action = BPMService.set_action_request(task_id)
        return 'success' if task_action else 'error'

    @staticmethod
    def due_task(task_id):
        """Set a due date for a task."""
        task_due = BPMService.due_task(task_id)
        return 'success' if task_due else 'error'

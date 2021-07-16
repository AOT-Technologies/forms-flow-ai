"""This exposes task service."""

from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import TaskSchema, TaskVariableSchema
from .external import BPMService


class TaskService:
    """This class manages task service."""

    @staticmethod
    def get_all_tasks(token):
        """Get all tasks."""
        tasks = BPMService.get_all_tasks(token=token)
        task_list = None
        if tasks:
            task_schema = TaskSchema()
            task_list = task_schema.dump(tasks, many=True)
        return task_list

    @staticmethod
    def get_task(task_id, token):
        """Get task."""
        task = BPMService.get_task(task_id=task_id, token=token)
        task_list = None
        if task:
            task_schema = TaskSchema()
            task_list = task_schema.dump(task)
        return task_list

    @staticmethod
    def claim_task(task_id, data, token):
        """Claim a task."""
        task_claim = BPMService.claim_task(task_id=task_id, data=data, token=token)
        if task_claim:
            return "success"

        raise BusinessException("error", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def unclaim_task(task_id, data, token):
        """Unclaim a task."""
        task_unclaim = BPMService.unclaim_task(task_id=task_id, data=data, token=token)
        if task_unclaim:
            return "success"

        raise BusinessException("error", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def complete_task(task_id, data, token):
        """Complete a task."""
        task_complete = BPMService.complete_task(
            task_id=task_id, data=data, token=token
        )
        if task_complete:
            return "success"

        raise BusinessException("error", HTTPStatus.BAD_REQUEST)

"""This exposes task service."""

from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import TaskSchema, TaskVariableSchema
from .external import BPMService


class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        """Get all tasks."""
        tasks = BPMService.get_all_tasks()
        task_list = None
        if tasks:
            task_schema = TaskSchema()
            task_list = task_schema.dump(tasks, many=True)
            for entry in task_list:
                task_variables = BPMService.get_task_variables(entry['processInstanceId'])
                task_variable_schema = TaskVariableSchema()
                task_variable_list = task_variable_schema.dump(task_variables, many=True)
                entry['variables'] = task_variable_list
        return task_list

    @staticmethod
    def get_task(task_id):
        """Get task."""
        task = BPMService.get_task(task_id)
        task_list = None
        if task:
            task_schema = TaskSchema()
            task_list = task_schema.dump(task, many=True)
            for entry in task_list:
                task_variables = BPMService.get_task_variables(entry['processInstanceId'])
                task_variable_schema = TaskVariableSchema()
                task_variable_list = task_variable_schema.dump(task_variables, many=True)
                entry['variables'] = task_variable_list
        return task_list

    @staticmethod
    def claim_task(task_id, data):
        """Claim a task."""
        task_claim = BPMService.claim_task(task_id, data)
        if task_claim:
            return 'success'

        raise BusinessException('error', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def unclaim_task(task_id, data):
        """Unclaim a task."""
        task_unclaim = BPMService.unclaim_task(task_id, data)
        if task_unclaim:
            return 'success'

        raise BusinessException('error', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def complete_task(task_id, data):
        """Complete a task."""
        task_complete = BPMService.complete_task(task_id, data)
        if task_complete:
            return 'success'

        raise BusinessException('error', HTTPStatus.BAD_REQUEST)

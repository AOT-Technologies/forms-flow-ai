"""This exposes task service."""
from ..schemas import TaskSchema, TaskVariableSchema
from .external import BPMService


class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        """Get all tasks."""
        task = BPMService.get_all_tasks()
        task_list = ''
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
    def get_task(task_id):
        """Get task."""
        task = BPMService.get_task(task_id)
        task_list = ''
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
        return 'success' if task_claim else 'error'

    @staticmethod
    def unclaim_task(task_id, data):
        """Claim a task."""
        task_unclaim = BPMService.unclaim_task(task_id, data)
        return 'success' if task_unclaim else 'error'

    @staticmethod
    def complete_task(task_id, data):
        """Claim a task."""
        task_complete = BPMService.complete_task(task_id, data)
        return 'success' if task_complete else 'error'

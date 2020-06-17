"""This exposes task service."""
from http import HTTPStatus
import json
from ..exceptions import BusinessException
from ..schemas import TaskSchema, TaskVariableSchema

from .external import BPMService
from ..utils.logging import log_info

class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        """Get all tasks."""
        task = BPMService.get_all_tasks()
        taskList = ''
        if task:
            task_schema = TaskSchema()
            taskList = task_schema.dump(task, many=True)
            for entry in taskList:
                taskVariables = BPMService.get_task_variables(entry['processInstanceId'])
                taskvariables_schema = TaskVariableSchema()
                taskVariablesList = taskvariables_schema.dump(taskVariables, many=True)
                entry['variables'] = taskVariablesList
        return taskList
    
    @staticmethod
    def get_task(task_id):
        """Get task."""
        task = BPMService.get_task(task_id)
        taskList = ''
        if task:
            task_schema = TaskSchema()
            taskList = task_schema.dump(task, many=True)
            for entry in taskList:
                taskVariables = BPMService.get_task_variables(entry['processInstanceId'])
                taskvariables_schema = TaskVariableSchema()
                taskVariablesList = taskvariables_schema.dump(taskVariables, many=True)
                entry['variables'] = taskVariablesList
        return taskList
    
    @staticmethod
    def claim_task(task_id, data):
        """Claim a task."""
        task_claim = BPMService.claim_task(task_id,data)
        return 'success' if task_claim else 'error'
    
    @staticmethod
    def unclaim_task(task_id, data):
        """Claim a task."""
        task_unclaim = BPMService.unclaim_task(task_id,data)
        return 'success' if task_unclaim else 'error'

    @staticmethod
    def complete_task(task_id, data):
        """Claim a task."""
        task_complete = BPMService.complete_task(task_id,data)
        return 'success' if task_complete else 'error'
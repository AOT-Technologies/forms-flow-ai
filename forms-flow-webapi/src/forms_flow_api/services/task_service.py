import os
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import TaskListSchema
from .external import BPMService


BPM_API_BASE = os.getenv('BPM_API_BASE', '')
API_TASK = os.getenv('API_TASK', '')
API_TASK_HISTORY = os.getenv('API_TASK_HISTORY', '')
BPM_API_TASK = BPM_API_BASE + API_TASK
BPM_API_TASK_HISTORY = BPM_API_BASE + API_TASK_HISTORY


class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        try:
            url = BPM_API_TASK_HISTORY
            task = BPMService.get_request(url)
            if task == []:
                return task
            else:
                return TaskListSchema.dump(task)
        except Exception as err:
            return "Error"

    @staticmethod
    def get_a_task(taskId):
        url = BPM_API_TASK + taskId
        task_details = BPMService.get_request(url)
        if not task_details:
            raise BusinessException('Invalid task', HTTPStatus.BAD_REQUEST)
        else:
            return TaskListSchema.dump(task_details)

    @staticmethod
    def claim_a_task(taskId):
        url = BPM_API_TASK + taskId + '/claim'
        task_claim = BPMService.post_request(url)
        if task_claim.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def unclaim_a_task(taskId):
        url = BPM_API_TASK + taskId + '/unclaim'
        task_unclaim = BPMService.post_request(url)
        if task_unclaim.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def set_action_a_task(taskId):
        url = BPM_API_TASK + taskId + '/complete'
        task_action = BPMService.post_request(url)
        if task_action.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def due_a_task(taskId):

        url = BPM_API_TASK + taskId + '/unclaim'
        task_due = BPMService.post_request(url)
        if task_due.status == 204:
            return "success"
        else:
            return "error"

import os
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import TaskListSchema
from .external import ExtendedBPMService as BPMService


class TaskService():
    """This class manages task service."""

    @staticmethod
    def get_all_tasks():
        try:
            task = BPMService.get_all_tasks()
            if task == []:
                return task
            else:
                return TaskListSchema.dump(task)
        except Exception as err:
            return "Error"

    @staticmethod
    def get_a_task(taskId):
        task_details = BPMService.get_task_details(taskId)
        if not task_details:
            raise BusinessException('Invalid task', HTTPStatus.BAD_REQUEST)
        else:
            return TaskListSchema.dump(task_details)

    @staticmethod
    def claim_a_task(taskId):
        task_claim = BPMService.claim_a_task(taskId)
        if task_claim.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def unclaim_a_task(taskId):
        task_unclaim = BPMService.unclaim_task(taskId)
        if task_unclaim.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def set_action_a_task(taskId):
        task_action = BPMService.set_action_request(taskId)
        if task_action.status == 204:
            return "success"
        else:
            return "error"

    @staticmethod
    def due_a_task(taskId):
        task_due = BPMService.due_a_task(taskId)
        if task_due.status == 204:
            return "success"
        else:
            return "error"

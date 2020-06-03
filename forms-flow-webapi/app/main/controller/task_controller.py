from flask import request
from flask_restplus import Resource

from ..utils.dto import TaskDto
from ..common.responses import response
from ..service.task_service import get_a_task, get_all_tasks, claim_a_task, unclaim_a_task, set_action_a_task, due_a_task
from ..common import writeException
from ..common.authentication import verify_auth_token

api = TaskDto.api
_application = TaskDto.task


@api.route('/')
class TaskList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_tasks')
    def get(self):
        """List all tasks"""
        if verify_auth_token() == True:
            return get_all_tasks()
        else:
            return verify_auth_token()


@api.route('/<taskId>')
@api.param('taskId', 'The task identifier')
class TaskDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a task')
    def get(self, taskId):
        """Get task detail"""
        if verify_auth_token() == True:
            return  get_a_task(taskId)
        else:
            return verify_auth_token()

@api.route('/<taskId>/claim')
@api.param('taskId', 'The task identifier')
class TaskClaim(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('claim a task')
    def get(self, taskId):
        """Claim a task"""
        if verify_auth_token() == True:
            return  claim_a_task(taskId)
        else:
            return verify_auth_token()

@api.route('/<taskId>/unclaim')
@api.param('taskId', 'The task identifier')
class TaskUnclaim(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('unclaim a task')
    def get(self, taskId):
        """Unclaim a task"""
        if verify_auth_token() == True:
            return  unclaim_a_task(taskId)
        else:
            return verify_auth_token()

@api.route('/<taskId>/action')
@api.param('taskId', 'The task identifier')
class TaskAction(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('set action for a task')
    def get(self, taskId):
        """Set action for a task"""
        if verify_auth_token() == True:
            return  set_action_a_task(taskId)
        else:
            return verify_auth_token()


@api.route('/<taskId>/due')
@api.param('taskId', 'The task identifier')
class TaskDue(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('set due for a task')
    def get(self, taskId):
        """Set due for a task"""
        if verify_auth_token() == True:
            return  due_a_task(taskId)
        else:
            return verify_auth_token()




from flask import request
from flask_restplus import Resource

from ..utils.dto import TaskDto
from ..common.responses import response
from ..service.task_service import get_a_task, get_all_tasks, claim_a_task
from ..common import writeException
from ..common.authentication import verify_auth_token

api = TaskDto.api
_application = TaskDto.task


@api.route('/')
class TaskList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_tasks')
    # @api.marshal_list_with(_application, envelope='data')
    # @api.marshal_with(_application)
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
    # @api.marshal_with(_application)
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
    # @api.marshal_with(_application)
    def get(self, taskId):
        """Claim a task"""
        if verify_auth_token() == True:
            return  claim_a_task(taskId)
        else:
            return verify_auth_token()





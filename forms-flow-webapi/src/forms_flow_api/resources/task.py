from flask_restplus import Resource

from ..common.responses import response
from ..services.task_service import claim_a_task, due_a_task, get_a_task, get_all_tasks, set_action_a_task, unclaim_a_task
from ..utils.dto import TaskDto


api = TaskDto.api
_application = TaskDto.task


@api.route('/')
class TaskList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_tasks')
    def get(self):
        """List all tasks"""
        return get_all_tasks()


@api.route('/<taskId>')
@api.param('taskId', 'The task identifier')
class TaskDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a task')
    def get(self, taskId):
        """Get task detail"""
        return get_a_task(taskId)


@api.route('/<taskId>/claim')
@api.param('taskId', 'The task identifier')
class TaskClaim(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('claim a task')
    def get(self, taskId):
        """Claim a task"""
        return claim_a_task(taskId)


@api.route('/<taskId>/unclaim')
@api.param('taskId', 'The task identifier')
class TaskUnclaim(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('unclaim a task')
    def get(self, taskId):
        """Unclaim a task"""
        return unclaim_a_task(taskId)


@api.route('/<taskId>/action')
@api.param('taskId', 'The task identifier')
class TaskAction(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('set action for a task')
    def get(self, taskId):
        """Set action for a task"""
        return set_action_a_task(taskId)


@api.route('/<taskId>/due')
@api.param('taskId', 'The task identifier')
class TaskDue(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('set due for a task')
    def get(self, taskId):
        """Set due for a task"""
        return due_a_task(taskId)

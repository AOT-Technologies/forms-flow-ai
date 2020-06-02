from flask import request
from flask_restplus import Resource

from ..utils.dto import ApplicationDto,NewApplicationDto
from ..common.responses import response
from ..service.application_service import save_new_application, get_all_applications, get_a_application,update_application, delete_application
from ..common import writeException
from ..common.authentication import verify_auth_token

api = ApplicationDto.api
_application = ApplicationDto.application

createapi = NewApplicationDto.api
_newapplication = NewApplicationDto.newapplication

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
            return get_all_applications()
        else:
            return verify_auth_token()


@api.route('/<taskId>')
@api.param('taskId', 'The Application identifier')
class TaskDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a task')
    # @api.marshal_with(_application)
    def get(self, applicationId):
        """Get task detail"""
        if verify_auth_token() == True:
            return  get_a_application(applicationId)
        else:
            return verify_auth_token()





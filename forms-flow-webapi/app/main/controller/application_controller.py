from flask import request
from flask_restplus import Resource

from ..utils.dto import ApplicationDto,NewApplicationsDto
from ..common.responses import response
from ..service.application_service import save_new_application, get_all_applications, get_a_application,update_application
from ..common import writeException

api = ApplicationDto.api
_application = ApplicationDto.application

createapi = NewApplicationsDto.api
_newapplication = NewApplicationsDto.newapplication


@api.route('/')
class ApplicationList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_applications')
    @api.marshal_list_with(_application, envelope='data')
    def get(self):
        """List all applications"""
        return get_all_applications()


@api.route('/create')
class ApplicationCreate(Resource):
    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('create a new application')
    @createapi.expect(_newapplication, validate=True)
    def post(self):
        """Create a new application with process. """
        writeException("create")
        data = request.json
        return save_new_application(data=data)


@api.route('/<Id>')
@api.param('Id', 'The Application identifier')
class ApplicationDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a application')
    @api.marshal_with(_application)
    def get(self, Id):
        """Get application detail"""
        application = get_a_application(Id)
        if not application:
            api.abort(404)
        else:
            return application


    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('Update an application')
    @createapi.expect(_newapplication, validate=True)
    def post(self,Id):
        """Update an application """
        data = request.json
        return update_application(Id,data=data)
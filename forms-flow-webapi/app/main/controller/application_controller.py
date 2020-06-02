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
class ApplicationList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_applications')
    # @api.marshal_list_with(_application, envelope='data')
    @api.response(200, 'Success', _application)
    # @api.marshal_with(_application)
    def get(self):
        """List all applications"""
        if verify_auth_token() == True:
            return get_all_applications()
        else:
            return verify_auth_token()

    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('create a new application')
    @createapi.expect(_newapplication, validate=True)
    def post(self):
        """Create a new application. """
        if verify_auth_token() == True:
            data = request.json
            return save_new_application(data=data)
        else:
            return verify_auth_token()

@api.route('/<applicationId>')
@api.param('applicationId', 'The Application identifier')
class ApplicationDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a application')
    # @api.marshal_with(_application)
    def get(self, applicationId):
        """Get application detail"""
        if verify_auth_token() == True:
            return  get_a_application(applicationId)
        else:
            return verify_auth_token()

    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('Update an application')
    @createapi.expect(_newapplication, validate=True)
    def put(self,applicationId):
        """Update an application """
        if verify_auth_token() == True:
            data = request.json
            return update_application(applicationId,data=data)
        else:
            return verify_auth_token()


    @api.response(response().created_code, response().created_message)
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('Delete an application')
    def delete(self,applicationId):
        """delete an application """
        if verify_auth_token() == True:
            return delete_application(applicationId)
        else:
            return verify_auth_token()

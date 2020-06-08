from flask import request
from flask_restplus import Resource

from ..common.responses import response
from ..service.application_service import delete_application, get_a_application, get_all_applications, save_new_application, update_application
from ..utils.dto import ApplicationDto, NewApplicationDto

api = ApplicationDto.api
_application = ApplicationDto.application

createapi = NewApplicationDto.api
_newapplication = NewApplicationDto.newapplication


@api.route('/')
class ApplicationList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_applications')
    @api.param('pageNo', 'PageNumber')
    @api.param('limit', 'Items per page')
    # @api.marshal_list_with(_application, envelope='data')
    # @api.marshal_with(_application)
    def get(self):
        """List all applications"""
        pageNo = request.args.get('pageNo')
        limit = request.args.get('limit')
        return get_all_applications(pageNo, limit)

    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('create a new application')
    @createapi.expect(_newapplication, validate=True)
    def post(self):
        """Create a new application. """
        data = request.json
        return save_new_application(data=data)


@api.route('/<applicationId>')
@api.param('applicationId', 'The Application identifier')
class ApplicationDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a application')
    # @api.marshal_with(_application)
    def get(self, applicationId):
        """Get application detail"""
        return get_a_application(applicationId)


    @createapi.response(response().created_code, response().created_message)
    @createapi.response(response().error_code, response().error_message)
    @createapi.response(response().notfound_code, response().notfound_message)
    @createapi.doc('Update an application')
    @createapi.expect(_newapplication, validate=True)
    def put(self, applicationId):
        """Update an application """
        data = request.json
        return update_application(applicationId, data=data)

    @api.response(response().created_code, response().created_message)
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('Delete an application')
    def delete(self, applicationId):
        """delete an application """
        return delete_application(applicationId)

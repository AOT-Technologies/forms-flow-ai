from flask_restplus import Resource

from ..common.authentication import verify_auth_token
from ..common.responses import response
from ..service.process_service import get_a_process, get_a_process_action, get_all_processes
from ..utils.dto import ProcessDto


api = ProcessDto.api
_process = ProcessDto.process


@api.route('/')
class ProcessList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('list_of_process')
    # @api.marshal_list_with(_process, envelope='data')
    def get(self):
        """List all process"""
        if verify_auth_token() == True:
            return get_all_processes()
        else:
            return verify_auth_token()


@api.route('/<Id>')
@api.param('Id', 'The Process identifier')
class ApplicationDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get a process definition')
    # @api.marshal_with(_process)
    def get(self, Id):
        """Get process detail"""
        if verify_auth_token() == True:
            return get_a_process(Id)
        else:
            return verify_auth_token()


@api.route('/<Id>/action')
@api.param('Id', 'The Process identifier')
class ApplicationActionDetails(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('get process Action list')
    # @api.marshal_with(_process)
    def get(self, Id):
        """Get process Action list"""
        if verify_auth_token() == True:
            return get_a_process_action(Id)
        else:
            return verify_auth_token()

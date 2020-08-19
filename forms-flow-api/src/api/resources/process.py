"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from ..exceptions import BusinessException
from ..services import ProcessService
from ..utils.auth import auth
from ..utils.util import cors_preflight


API = Namespace('Process', description='Process')


@cors_preflight('GET,OPTIONS')
@API.route('/<string:process_key>/task/<string:task_key>/state', methods=['GET', 'OPTIONS'])
class ProcessStateResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get(process_key, task_key):
        """Get states by process and task key."""
        try:
            return jsonify(ProcessService.get_states(process_key, task_key, request.headers["Authorization"])), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET', 'OPTIONS'])
class ProcessResource(Resource):
    """Resource for managing process."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get():
        """Get all process."""
        try:
             return jsonify({
                 'process': ProcessService.get_all_processes(request.headers["Authorization"])
             }), HTTPStatus.OK
        except BusinessException as err:
             return err.error, err.status_code


# @cors_preflight('GET,OPTIONS')
# @API.route('/<int:process_key>', methods=['GET', 'OPTIONS'])
# class ProcessDetailsResource(Resource):
#     """Resource for managing process details."""

#     @staticmethod
#     @cors.crossdomain(origin='*')
#     def get(process_key):
#         """Get process details."""
#         try:
#             return ProcessService.get_process(process_key), HTTPStatus.OK
#         except BusinessException as err:
#             return err.error, err.status_code


# @cors_preflight('GET,OPTIONS')
# @API.route('/<int:process_key>/action', methods=['GET', 'OPTIONS'])
# class ProcessActionsResource(Resource):
#     """Resource for managing process ations."""

#     @staticmethod
#     @cors.crossdomain(origin='*')
#     def get(process_key):
#         """Get process action details."""
#         try:
#             return ProcessService.get_process_action(process_key), HTTPStatus.OK
#         except BusinessException as err:
#             return err.error, err.status_code

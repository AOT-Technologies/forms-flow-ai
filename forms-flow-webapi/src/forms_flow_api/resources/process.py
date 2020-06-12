"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from ..exceptions import BusinessException
from ..services import ProcessService
from ..utils.util import cors_preflight


API = Namespace('Process', description='Process')


@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET', 'OPTIONS'])
class ProcessResource(Resource):
    """Resource for managing process."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Get all process."""
        try:
            return jsonify({
                'process': ProcessService.get_all_processes()
            }), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code


@cors_preflight('GET,OPTIONS')
@API.route('/<int:process_key>', methods=['GET'])
class ProcessDetailsResource(Resource):
    """Resource for managing process details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(process_key):
        """Get process details."""
        try:
            return ProcessService.get_process(process_key), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code


@cors_preflight('GET,OPTIONS')
@API.route('/<int:process_key>/action', methods=['GET'])
class ProcessActionsResource(Resource):
    """Resource for managing process ations."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(process_key):
        """Get process action details."""
        try:
            return ProcessService.get_process_action(process_key), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

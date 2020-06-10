"""API endpoints for managing process resource."""

from http import HTTPStatus
from flask import request
from flask import jsonify
from flask_restplus import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..services import ProcessService
from ..utils.util import cors_preflight
from ..models import Process

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
@API.route('/<processKey>', methods=['GET'])
class ProcessDetailsResource(Resource):
    """Resource for managing process details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(processKey):
        """Get process detail"""
        try:
            return ProcessService.get_a_process(processKey), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code



@cors_preflight('GET,OPTIONS')
@API.route('/<processKey>/action', methods=['GET'])
class ProcessActionsResource(Resource):
    """Resource for managing process ations."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(processKey):
        """Get process detail"""
        try:
            return  ProcessService.get_a_process_action(processKey), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code


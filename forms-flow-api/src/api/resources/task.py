"""API endpoints for managing task resource."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from ..services import TaskService
from ..utils.auth import auth
from ..utils.util import cors_preflight


API = Namespace('Task', description='Task')


@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET', 'OPTIONS'])
class TaskList(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get():
        """List all tasks."""
        return jsonify({
            'tasks': TaskService.get_all_tasks(request.headers["Authorization"])
        }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/<string:task_id>', methods=['GET', 'OPTIONS'])
class Task(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get(task_id):
        """List specific tasks."""
        return jsonify({
            'task': TaskService.get_task(task_id, request.headers["Authorization"])
        }), HTTPStatus.OK


@cors_preflight('POST,OPTIONS')
@API.route('/<string:task_id>/claim', methods=['POST', 'OPTIONS'])
class TaskClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def post(task_id):
        """Claim a task."""
        request_json = request.get_json()
        return jsonify({
            'tasks': TaskService.claim_task(task_id, request_json, request.headers["Authorization"])
        }), HTTPStatus.OK


@cors_preflight('POST,OPTIONS')
@API.route('/<string:task_id>/unclaim', methods=['POST', 'OPTIONS'])
class TaskUnClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def post(task_id):
        """Unclaim a task."""
        request_json = request.get_json()
        return jsonify({
            'tasks': TaskService.unclaim_task(task_id, request_json, request.headers["Authorization"])
        }), HTTPStatus.OK


@cors_preflight('POST,OPTIONS')
@API.route('/<string:task_id>/complete', methods=['POST', 'OPTIONS'])
class TaskComplete(Resource):
    """Resource for claim task."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def post(task_id):
        """Complete a task."""
        request_json = request.get_json()
        return jsonify({
            'tasks': TaskService.complete_task(task_id, request_json, request.headers["Authorization"])
        }), HTTPStatus.OK

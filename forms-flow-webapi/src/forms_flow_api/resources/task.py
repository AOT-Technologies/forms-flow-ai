"""API endpoints for managing task resource."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas import TaskListSchema
from ..services import TaskService
from ..utils.util import cors_preflight



API = Namespace('Task', description='Task')

@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET','OPTIONS'])
class TaskList(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """List all tasks"""
        return jsonify({
            'tasks': TaskService.get_all_tasks()
        }), HTTPStatus.OK

@cors_preflight('GET,OPTIONS')
@API.route('/taskId', methods=['GET', 'OPTIONS'])
class TaskDetails(Resource):
    """Resource for task details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(taskId):
        """Get task detail"""
        return jsonify({
            'tasks': TaskService.get_a_task(taskId)
            }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/taskId/claim', methods=['GET', 'OPTIONS'])
class TaskClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    def get(taskId):
        """Claim a task"""
        return jsonify({
            'tasks': TaskService.claim_a_task(taskId)
            }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/taskId/unclaim', methods=['GET', 'OPTIONS'])
class TaskUnclaim(Resource):
    """Resource for unclaim task."""

    @staticmethod
    def get(taskId):
        """Unclaim a task"""
        return jsonify({
            'tasks': TaskService.unclaim_a_task(taskId)
            }), HTTPStatus.OK



@cors_preflight('GET,OPTIONS')
@API.route('/taskId/action', methods=['GET', 'OPTIONS'])
class TaskAction(Resource):
    """Resource for do task actions."""

    @staticmethod
    def get(taskId):
        """Set action for a task"""
        return jsonify({
            'tasks': TaskService.set_action_a_task(taskId)
            }), 


@cors_preflight('GET,OPTIONS')
@API.route('/taskId/due', methods=['GET', 'OPTIONS'])
class TaskAction(Resource):
    """Resource for set due for task."""

    @staticmethod
    def get(taskId):
        """set due for a task"""
        return jsonify({
            'tasks': TaskService.due_a_task(taskId)
            }), 


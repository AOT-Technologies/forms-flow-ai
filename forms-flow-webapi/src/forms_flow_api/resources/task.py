"""API endpoints for managing task resource."""

from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from ..services import TaskService
from ..utils.util import cors_preflight


API = Namespace('Task', description='Task')


@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET', 'OPTIONS'])
class TaskList(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """List all tasks."""
        return jsonify({
            'tasks': TaskService.get_all_tasks()
        }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/<int:task_id>', methods=['GET', 'OPTIONS'])
class TaskDetails(Resource):
    """Resource for task details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(task_id):
        """Get task details."""
        return jsonify({
            'tasks': TaskService.get_task(task_id)
        }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/<int:task_id>/claim', methods=['GET', 'OPTIONS'])
class TaskClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    def get(task_id):
        """Claim a task."""
        return jsonify({
            'tasks': TaskService.claim_task(task_id)
        }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/<int:task_id>/unclaim', methods=['GET', 'OPTIONS'])
class TaskUnclaim(Resource):
    """Resource for unclaim task."""

    @staticmethod
    def get(task_id):
        """Unclaim a task."""
        return jsonify({
            'tasks': TaskService.unclaim_task(task_id)
        }), HTTPStatus.OK


@cors_preflight('GET,OPTIONS')
@API.route('/<int:task_id>/action', methods=['GET', 'OPTIONS'])
class TaskAction(Resource):
    """Resource for do task actions."""

    @staticmethod
    def get(task_id):
        """Set action for a task."""
        return jsonify({
            'tasks': TaskService.set_action_task(task_id)
        }),


@cors_preflight('GET,OPTIONS')
@API.route('/<int:task_id>/due', methods=['GET', 'OPTIONS'])
class TaskActionDue(Resource):
    """Resource for set due for task."""

    @staticmethod
    def get(task_id):
        """Set due for a task."""
        return jsonify({
            'tasks': TaskService.due_task(task_id)
        }),

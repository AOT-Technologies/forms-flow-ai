"""API endpoints for managing tasks resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services import TaskService

API = Namespace("Tasks", description="Manages user tasks operations.")

task_outcome_request = API.model(
    "TaskOutcomeRequest",
    {
        "taskId": fields.String(description="Task ID", required=True),
        "taskOutcome": fields.List(
            fields.Raw(description="Task outcome"), required=True, min_items=1
        ),
    },
)

task_outcome_response = API.model(
    "TaskOutcomeResponse",
    {
        "id": fields.Integer(description="Task outcome ID"),
        "taskId": fields.String(description="Task ID"),
        "taskOutcome": fields.List(
            fields.Raw(description="Task outcome"), required=True, min_items=1
        ),
        "createdBy": fields.String(description="Created by"),
        "tenant": fields.String(description="Tenant key"),
        "created": fields.DateTime(description="Created date"),
    },
)


@cors_preflight("POST, OPTIONS")
@API.route("/task-outcome", methods=["POST", "OPTIONS"])
class TaskOutcomeResource(Resource):
    """Resource to create task outcome configuration."""

    @staticmethod
    @auth.require
    @profiletime
    @API.expect(task_outcome_request)
    @API.doc(
        responses={
            201: ("CREATED:- Successful request.", task_outcome_response),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def post():
        """Create task outcome configuration."""
        data = request.get_json()
        if not data:
            return {"message": "Invalid input"}, HTTPStatus.BAD_REQUEST
        response = TaskService().create_task_outcome(data)
        return response, HTTPStatus.CREATED


@cors_preflight("GET, OPTIONS")
@API.route("/task-outcome/<string:task_id>", methods=["GET", "OPTIONS"])
@API.param("task_id", "Task ID")
class TaskOutcomeByIdResource(Resource):
    """Resource to get task outcome configuration by task ID."""

    @staticmethod
    @auth.require
    @profiletime
    @profiletime
    @API.doc(
        responses={
            200: ("OK:- Successful request.", task_outcome_response),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def get(task_id: str):
        """Get task outcome configuration by task ID."""
        response = TaskService().get_task_outcome(task_id)
        return response, HTTPStatus.OK

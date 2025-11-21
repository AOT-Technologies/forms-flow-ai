"""API endpoints for managing tasks resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    MANAGE_TASKS,
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
        "taskName": fields.String(
            description="Task name", required=True, allow_none=True
        ),
        "transitionMapType": fields.String(
            description="Task transition map type - select/input/radio", required=True
        ),
        "taskTransitionMap": fields.Raw(
            description="Determines the next step in workflow - accepts list, dict, string",
            required=True,
        ),
    },
)

task_outcome_response = API.inherit(
    "TaskOutcomeResponse",
    task_outcome_request,
    {
        "id": fields.Integer(description="Task outcome configuration ID"),
        "createdBy": fields.String(description="Created by"),
        "tenant": fields.String(description="Tenant key"),
        "created": fields.DateTime(description="Created date"),
    },
)

# Task completion request models
variable_value_model = API.model(
    "TaskCompletionVariableValue",
    {"value": fields.Raw(required=True, description="Variable value")},
)

bpmn_variables_model = API.model(
    "TaskCompletionBpmnVariables",
    {
        "formUrl": fields.Nested(
            variable_value_model, required=True, description="Form URL used by Camunda"
        ),
        "applicationId": fields.Nested(
            variable_value_model, required=True, description="Application ID"
        ),
        "webFormUrl": fields.Nested(
            variable_value_model, required=True, description="Web form URL"
        ),
        "action": fields.Nested(
            variable_value_model,
            required=True,
            description="Action string (e.g., Reviewed)",
        ),
    },
)

bpmn_data_model = API.model(
    "TaskCompletionBpmnData",
    {
        "variables": fields.Nested(
            bpmn_variables_model, required=True, description="Camunda variables"
        ),
    },
)

application_data_model = API.model(
    "TaskCompletionApplicationData",
    {
        "applicationId": fields.Integer(required=True, description="Application ID"),
        "applicationStatus": fields.String(
            required=True, description="Application status"
        ),
        "formUrl": fields.String(
            required=True, description="Form URL of created submission"
        ),
        "submittedBy": fields.String(
            required=True, description="User name who submitted"
        ),
        "privateNotes": fields.String(required=False, description="Private notes"),
    },
)

task_completion_request_model = API.model(
    "TaskCompletionRequest",
    {
        "bpmnData": fields.Nested(
            bpmn_data_model, required=True, description="Camunda completion variables"
        ),
        "applicationData": fields.Nested(
            application_data_model, required=True, description="Application metadata"
        ),
    },
)


@cors_preflight("POST, OPTIONS")
@API.route("/task-outcome-configuration", methods=["POST", "OPTIONS"])
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
        """Create task outcome configuration.

        Accepts a JSON payload containing workflow configuration details.
        The configuration includes transition rules and transition rules type for task outcomes.

        Request Body:
            dict: Required JSON payload with structure:
                {
                    "taskId": str,
                    "taskName": str,
                    "transitionMapType": str,     # "select", "radio", or "input"
                    "taskTransitionMap": dict     # Outcome-to-step mappings supporting list, dict, string
                }
        Returns:
            dict: Task outcome configuration with structure:
                {
                    "id": int,
                    "taskId": str,
                    "taskName": str,
                    "tenant": str,
                    "transitionMapType": str,  # "select", "radio", or "input"
                    "taskTransitionMap": dict,  # mapping outcomes to subsequent workflow steps
                    "created": str,
                    "createdBy": str,
                }
        """
        data = request.get_json()
        if not data:
            return {"message": "Invalid input"}, HTTPStatus.BAD_REQUEST
        response = TaskService().create_task_outcome_configuration(data)
        return response, HTTPStatus.CREATED


@cors_preflight("GET, OPTIONS")
@API.route("/task-outcome-configuration/<string:task_id>", methods=["GET", "OPTIONS"])
@API.param("task_id", "Task ID")
class TaskOutcomeByIdResource(Resource):
    """Resource to get task outcome configuration by task ID."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: ("OK:- Successful request.", task_outcome_response),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def get(task_id: str):
        """Retrieves task outcome configuration by task ID.

        Fetches the complete workflow configuration for a specified task, including
        workflow routing rules (taskTransitionMap) and interface display preferences (transitionMapType),
        supporting 'select', 'radio', or 'input'

        Args:
        task_id (str): Unique identifier of the task (required)

        Returns:
            dict: Task outcome configuration with structure:
                {
                    "id": int,
                    "taskId": str,
                    "taskName": str,
                    "tenant": str,
                    "transitionMapType": str,  # "select", "radio", or "input"
                    "taskTransitionMap": dict,  # mapping outcomes to subsequent workflow steps
                    "created": str,
                    "createdBy": str,
                }
        """
        response = TaskService().get_task_outcome_configuration(task_id)
        return response, HTTPStatus.OK


@cors_preflight("POST, OPTIONS")
@API.route("/<string:task_id>/complete", methods=["POST", "OPTIONS"])
class TaskCompletionResource(Resource):
    """Resource to complete task and capture task completion details."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_TASKS])
    @profiletime
    @API.expect(task_completion_request_model)
    @API.doc(
        responses={
            200: ("OK:- Successful request."),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def post(task_id: str):
        """Complete a Camunda task and return the workflow response.

        Args:
            task_id (str): Identifier of the Camunda user task to complete.

        Returns:
            tuple[dict, HTTPStatus]: Response body from the BPM service and HTTP status.

        Request JSON:
            {
                "bpmnData": {
                    "variables": {
                        "formUrl": {"value": "http://.../submission/690ded51944a118ff360502f"},
                        "applicationId": {"value": 28},
                        "webFormUrl": {"value": "http://.../submission/690ded51944a118ff360502f"},
                        "action": {"value": "Reviewed"}
                    }
                },
                "applicationData": {
                    "applicationId": 28,
                    "applicationStatus": "Reviewed",
                    "formUrl": "http://.../submission/690ded51944a118ff360502f",
                    "submittedBy": "John Doe",
                    "privateNotes": "blah blah"
                }
            }
        """
        data = request.get_json()
        if not data:
            return {"message": "Invalid input"}, HTTPStatus.BAD_REQUEST
        response = TaskService().complete_task(task_id, data)
        return response, HTTPStatus.OK

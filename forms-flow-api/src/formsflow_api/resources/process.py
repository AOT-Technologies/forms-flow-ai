"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    MANAGE_ADVANCE_FLOWS,
    VIEW_DESIGNS,
    VIEW_TASKS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import ProcessDataSchema
from formsflow_api.services import ProcessService

API = Namespace("Process", description="Manages process/workflow operations.")

process_request = API.model(
    "ProcessRequest",
    {
        "processType": fields.String(
            description="Process Type - BPMN/DMN/LOWCODE", default="BPMN"
        ),
        "processData": fields.String(description="Process data"),
    },
)

process_history_response_model = API.model(
    "ProcessHistoryResponse",
    {
        "processHistory": fields.List(
            fields.Nested(
                API.model(
                    "ProcessHistory",
                    {
                        "id": fields.Integer(description="Unique id of the process"),
                        "created": fields.DateTime(description="Created time"),
                        "createdBy": fields.String(),
                        "processType": fields.String(description="Process Type"),
                        "processName": fields.String(),
                        "majorVersion": fields.Integer(),
                        "minorVersion": fields.Integer(),
                        "isMajor": fields.Boolean(),
                        "publishedBy": fields.String(),
                        "publishedOn": fields.String(),
                        "modified": fields.String(),
                    },
                )
            )
        ),
        "totalCount": fields.Integer(),
    },
)

process_response_base_model = API.model(
    "BaseProcessResponse",
    {
        "id": fields.Integer(description="Unique id of the process"),
        "name": fields.String(description="Process name"),
        "status": fields.String(description="Process status"),
        "processType": fields.String(),
        "tenant": fields.String(description="Authorized Tenant to the process"),
        "created": fields.DateTime(description="Created time"),
        "modified": fields.DateTime(description="Modified time"),
        "createdBy": fields.String(),
        "modifiedBy": fields.String(),
        "processKey": fields.String(),
        "parentProcessKey": fields.String(),
        "isSubflow": fields.Boolean(),
    },
)
process_response = API.inherit(
    "ProcessResponse",
    process_response_base_model,
    {
        "processData": fields.String(description="Process data"),
    },
)

process_list_model = API.model(
    "ProcessList",
    {
        "process": fields.List(fields.Nested(process_response_base_model)),
        "totalCount": fields.Integer(),
    },
)
migrate_request_model = API.model(
    "MigrateRequestModel",
    {
        "mapperId": fields.String(),
        "processKey": fields.String(),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class ProcessDataResource(Resource):
    """Resource to create and list process data."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
                "default": "1",
            },
            "limit": {
                "in": "query",
                "description": "Limit for paginated results",
                "default": "5",
            },
            "sortBy": {
                "in": "query",
                "description": "Name of column to sort by.",
                "default": "id",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
            },
            "name": {
                "in": "query",
                "description": "Retrieve form list based on process name.",
                "default": "",
            },
            "processType": {
                "in": "query",
                "description": "Retrieve form list based on process type.",
                "default": "BPMN",
                "enum": ["BPMN", "DMN", "LOWCODE"],
            },
            "status": {
                "in": "query",
                "description": "Retrieve form list based on status.",
                "enum": ["Draft", "Published"],
            },
            "id": {
                "in": "query",
                "description": "Filter process by id.",
                "type": "integer",
            },
            "modifiedFrom": {
                "in": "query",
                "description": "Filter process by modified from.",
                "type": "string",
            },
            "modifiedTo": {
                "in": "query",
                "description": "Filter process by modified to.",
                "type": "string",
            },
            "createdFrom": {
                "in": "query",
                "description": "Filter process by created from.",
                "type": "string",
            },
            "createdTo": {
                "in": "query",
                "description": "Filter process by created to.",
                "type": "string",
            },
            "createdBy": {
                "in": "query",
                "description": "Filter process by created by.",
                "type": "string",
            },
        },
        responses={
            200: "OK:- Successful request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=process_list_model,
    )
    def get():
        """List all process data."""
        process_list, count = ProcessService.get_all_process(
            request.args,
        )
        response = {
            "process": process_list,
            "totalCount": count,
        }
        return response, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.expect(process_request)
    @API.doc(
        responses={
            201: ("CREATED:- Successful request.", process_response),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def post():
        """Create process data."""
        data = request.get_json()
        process_data = data.get("processData")
        process_type = data.get("processType")
        response = ProcessService.create_process(
            process_data=process_data, process_type=process_type, is_subflow=True
        )
        response_data = ProcessDataSchema().dump(response)
        return response_data, HTTPStatus.CREATED


@cors_preflight("GET, PUT, DELETE, OPTIONS")
@API.route("/<int:process_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@API.doc(params={"process_id": "Process data corresponding to process id"})
class ProcessResourceById(Resource):
    """Resource for managing process by id."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS, MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=process_response,
    )
    def get(process_id: int):
        """Get process data by process id."""
        response, status = ProcessService.get_process_by_id(process_id), HTTPStatus.OK

        return response, status

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS, MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=process_response,
    )
    @API.expect(process_request)
    def put(process_id: int):
        """Update process data by id."""
        data = request.get_json()
        process_data = data.get("processData")
        process_type = data.get("processType")
        response, status = (
            ProcessService.update_process(
                process_id=process_id,
                process_type=process_type,
                process_data=process_data,
            ),
            HTTPStatus.OK,
        )
        return response, status

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        }
    )
    def delete(process_id: int):
        """Delete process data by id."""
        response, status = ProcessService.delete_process(process_id), HTTPStatus.OK
        return response, status


@cors_preflight("GET, OPTIONS")
@API.route("/<string:parent_process_key>/versions", methods=["GET", "OPTIONS"])
class ProcessHistoryResource(Resource):
    """Resource for retrieving process history."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS, VIEW_DESIGNS, MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
            },
            "limit": {"in": "query", "description": "Limit for paginated results"},
        },
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
            403: "FORBIDDEN:- Permission denied.",
        },
        model=process_history_response_model,
    )
    def get(parent_process_key: str):
        """Get history for a process by parent_process_key ."""
        # Retrieve all history related to the specified process

        process_history, count = ProcessService.get_all_history(
            parent_process_key, request.args
        )
        return (
            (
                {
                    "processHistory": process_history,
                    "totalCount": count,
                }
            ),
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/validate", methods=["GET", "OPTIONS"])
class ValidateProcess(Resource):
    """Resource for validating a process name or key."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(400, "BAD_REQUEST:- Invalid request.")
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(403, "FORBIDDEN:- Authorization will not help.")
    @API.doc(
        params={
            "processKey": {
                "in": "query",
                "description": "processKey to be validated",
            },
            "processName": {
                "in": "query",
                "description": "processName to be validated",
            },
            "parentProcessKey": {
                "in": "query",
                "description": "Used for validating title against an existing process",
            },
        }
    )
    def get():
        """Validates process name or process key.

        Retrieves the query parameters from the request, validates the process name or key,
        and returns a response indicating whether the process name/key is valid or not.
        """
        response = ProcessService.validate_process(request)
        return response, HTTPStatus.OK


@cors_preflight("POST,OPTIONS")
@API.route("/<process_id>/publish", methods=["POST", "OPTIONS"])
class PublishProcessResource(Resource):
    """Resource to support publish sub-process/worklfow."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    def post(process_id: int):
        """Publish process by process id."""
        return (
            ProcessService.publish(process_id),
            HTTPStatus.OK,
        )


@cors_preflight("POST,OPTIONS")
@API.route("/<process_id>/unpublish", methods=["POST", "OPTIONS"])
class UnpublishProcessResource(Resource):
    """Resource to support unpublish sub-process/workflow."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_ADVANCE_FLOWS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    def post(process_id: int):
        """Unpublish process by process_id."""
        return (
            ProcessService.unpublish(process_id),
            HTTPStatus.OK,
        )


@cors_preflight("GET, OPTIONS")
@API.route("/key/<string:process_key>", methods=["GET", "OPTIONS"])
@API.doc(params={"process_key": "Process data corresponding to process key"})
class ProcessResourceByProcessKey(Resource):
    """Resource for managing process by process key."""

    @staticmethod
    @auth.has_one_of_roles(
        [
            CREATE_DESIGNS,
            VIEW_DESIGNS,
            VIEW_TASKS,
            MANAGE_ADVANCE_FLOWS,
        ]
    )
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=process_response,
    )
    def get(process_key: str):
        """Get process data by process key."""
        response, status = (
            ProcessService.get_process_by_key(process_key, request),
            HTTPStatus.OK,
        )
        return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/migrate", methods=["POST", "OPTIONS"])
class MigrateResource(Resource):
    """Resource to support migration."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    @API.expect(migrate_request_model)
    def post():
        """Migrate process by process_key."""
        return (
            ProcessService.migrate(request),
            HTTPStatus.OK,
        )

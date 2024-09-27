"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services import ProcessService

API = Namespace("Process", description="Process")

process_request = API.model(
    "ProcessRequest",
    {
        "name": fields.String(description="Process name"),
        "status": fields.String(description="Process status"),
        "processType": fields.String(description="Process Type"),
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
                    },
                )
            )
        ),
        "totalCount": fields.Integer(),
    },
)

process_response = API.inherit(
    "ProcessResponse",
    process_request,
    {
        "tenant": fields.String(description="Authorized Tenant to the process"),
        "id": fields.Integer(description="Unique id of the process"),
        "created": fields.DateTime(description="Created time"),
        "modified": fields.DateTime(description="Modified time"),
        "createdBy": fields.String(),
        "modifiedBy": fields.String(),
    },
)

process_list_model = API.model(
    "ProcessList",
    {
        "process": fields.List(
            fields.Nested(
                API.model(
                    "Process",
                    {
                        "id": fields.Integer(description="Unique id of the process"),
                        "name": fields.String(description="Process name"),
                        "status": fields.String(description="Process status"),
                        "processType": fields.String(description="Process Type"),
                        "processData": fields.String(description="Process data"),
                        "tenant": fields.String(
                            description="Authorized Tenant to the process"
                        ),
                        "created": fields.DateTime(description="Created time"),
                        "modified": fields.DateTime(description="Modified time"),
                        "createdBy": fields.String(),
                        "modifiedBy": fields.String(),
                    },
                )
            )
        ),
        "totalCount": fields.Integer(),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class ProcessDataResource(Resource):
    """Resource to create and list process data."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
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
                "default": "",
            },
            "status": {
                "in": "query",
                "description": "Retrieve form list based on status.",
                "default": "",
            },
            "id": {
                "in": "query",
                "description": "Filter process by id.",
                "type": "int",
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
        process_list, count = ProcessService.get_all_process(request.args)
        response = {
            "process": process_list,
            "totalCount": count,
        }
        return response, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(
        responses={
            201: "CREATED:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=process_response,
    )
    def post():
        """Create process data."""
        response = ProcessService.create_process(request.get_json())
        return response, HTTPStatus.CREATED


@cors_preflight("GET, PUT, DELETE, OPTIONS")
@API.route("/<string:process_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@API.doc(params={"process_id": "Process data corresponding to process_id"})
class ProcessResourceById(Resource):
    """Resource for managing process by id."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=process_response,
    )
    def get(process_id: str):
        """Get process data by id."""
        response, status = ProcessService.get_process_by_key(process_id), HTTPStatus.OK

        return response, status

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
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
    def put(process_id: str):
        """Update process data by id."""
        response, status = (
            ProcessService.update_process(process_id, request.get_json()),
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
    def delete(process_id: str):
        """Delete process data by id."""
        response, status = ProcessService.delete_process(process_id), HTTPStatus.OK
        return response, status


@cors_preflight("GET, OPTIONS")
@API.route(
    "/process-history/<string:process_name>/versions", methods=["GET", "OPTIONS"]
)
class ProcessHistoryResource(Resource):
    """Resource for retrieving process history."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(
        params={
            "process_name": {
                "description": "Unique name of the process",
                "type": "string",
            },
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
    def get(process_name: str):
        """Get history for a process by process_name."""
        # Retrieve all history related to the specified process

        process_history, count = ProcessService.get_all_history(
            process_name, request.args
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
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(400, "BAD_REQUEST:- Invalid request.")
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(403, "FORBIDDEN:- Authorization will not help.")
    def get():
        """Handle GET requests for validating process name/key.

        Retrieves the query parameters from the request, validates the process name or key,
        and returns a response indicating whether the process name/key is valid or not.
        """
        response = ProcessService.validate_process(request)
        return response, HTTPStatus.OK

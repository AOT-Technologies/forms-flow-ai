"""API endpoints for filter resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import FilterSchema
from formsflow_api.services import FilterService

filter_schema = FilterSchema()

API = Namespace("Filter", description="Filter APIs")

criteria = API.model(
    "Criteria",
    {
        "candidateGroup": fields.String(description="Filter task specific to group"),
        "includeAssignedTasks": fields.Boolean(description="Include assigned task"),
    },
)

variable = API.model(
    "Variables",
    {
        "name": fields.String(description="Variable name"),
        "label": fields.String(description="Display name"),
    },
)

properties = API.model(
    "Properties",
    {"showUndefinedVariable": fields.Boolean(description="Show undefined variables")},
)

filter_request = API.model(
    "FilterRequest",
    {
        "name": fields.String(description="Name of the filter"),
        "description": fields.String(description="Description about filter"),
        "criteria": fields.Nested(criteria, description="Filter criteria"),
        "variables": fields.List(
            fields.Nested(variable, description=" Variables shown in the tasks list"),
        ),
        "properties": fields.Nested(properties, description="Properties of filter"),
        "roles": fields.List(
            fields.String(), description="Authorized Roles to the filter"
        ),
        "users": fields.List(
            fields.String(), description="Authorized Users to the filter"
        ),
    },
)
filter_response = API.inherit(
    "FilterResponse",
    filter_request,
    {
        "status": fields.String(description="Status of the filter"),
        "tenant": fields.String(description="Authorized Tenant to the filter"),
        "id": fields.Integer(description="Unique id of the filter"),
        "created": fields.DateTime(description="Created time"),
        "modified": fields.DateTime(description="Modified time"),
        "createdBy": fields.String(),
        "modifiedBy": fields.String(),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FilterResource(Resource):
    """Resource to create and list filter."""

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=[filter_response],
    )
    def get():
        """
        Get all filters.

        List all active filters for requests with ```reviewer permission```.
        """
        response, status = FilterService.get_all_filters(), HTTPStatus.OK
        return response, status

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            201: "CREATED:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=filter_response,
    )
    @API.expect(filter_request)
    def post():
        """
        Create filter.

        Post a new filter using request body for requests with ```reviewer permission```.
        e.g payload,
        ```
        {
            "name": "Test Task",
            "description": "Filter creation test task",
            "variables":[
                    {
                    "name": "name",
                    "label": "userName"
                    }
                ],
            "criteria": {
                "candidateGroup":"/formsflow/formsflow-reviewer",
                "includeAssignedTasks":true
            },
            "properties": {
                "showUndefinedVariable":false
            },
            "users": [],
            "roles": ["/formsflow/formsflow-reviewer"]
        }
        ```
        """
        filter_data = filter_schema.load(request.get_json())
        response, status = (
            FilterService.create_filter(filter_data),
            HTTPStatus.CREATED,
        )
        return response, status


@cors_preflight("GET, OPTIONS")
@API.route("/user", methods=["GET", "OPTIONS"])
class UsersFilterList(Resource):
    """Resource to list filters specific to current user."""

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=[filter_response],
    )
    def get():
        """
        List filters of current user.

        Get all active filters of current reviewer user for requests with ```reviewer permission```.
        """
        response, status = FilterService.get_user_filters(), HTTPStatus.OK
        return response, status


@cors_preflight("PUT, OPTIONS")
@API.route("/<int:filter_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@API.doc(params={"filter_id": "Filter details corresponding to filter_id"})
class FilterResourceById(Resource):
    """Resource for managing filter by id."""

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=filter_response,
    )
    def get(filter_id: int):
        """
        Get filter by id.

        Get filter details corresponding to a filter id for requests with ```REVIEWER_GROUP``` permission.
        """
        filter_result = FilterService.get_filter_by_id(filter_id)
        response, status = filter_schema.dump(filter_result), HTTPStatus.OK

        return response, status

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=filter_response,
    )
    @API.expect(filter_request)
    def put(filter_id: int):
        """
        Update filter by id.

        Update filter details corresponding to a filter id for requests with ```REVIEWER_GROUP``` permission.
        """
        filter_data = filter_schema.load(request.get_json())
        filter_result = FilterService.update_filter(filter_id, filter_data)
        response, status = (
            filter_schema.dump(filter_result),
            HTTPStatus.OK,
        )
        return response, status

    @staticmethod
    @auth.has_one_of_roles([REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        }
    )
    def delete(filter_id: int):
        """
        Delete filter by id.

        Delete filter corresponding to a filter id for requests with ```REVIEWER_GROUP``` permission.
        """
        FilterService.mark_inactive(filter_id=filter_id)
        response, status = "Deleted", HTTPStatus.OK

        return response, status

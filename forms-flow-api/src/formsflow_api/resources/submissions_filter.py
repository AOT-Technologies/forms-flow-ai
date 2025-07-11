"""API endpoints for managing analyze submissions filter preferences."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ANALYZE_SUBMISSIONS_VIEW,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services import SubmissionsFilterService

API = Namespace(
    "SubmissionsFilterPreferences",
    description="Analyze Submissions Filter Preferences",
)

variable = API.model(
    "Variables",
    {
        "name": fields.String(description="Variable name"),
        "label": fields.String(description="Display name"),
        "key": fields.String(description="Variable key"),
        "type": fields.String(description="Variable type"),
        "isChecked": fields.Boolean(description="Is variable checked"),
        "sortOrder": fields.Integer(description="Sort order of the variable"),
        "isFormVariable": fields.Boolean(description="Is this a form variable"),
    },
)

analyze_submissions_create_model = API.model(
    "SubmissionsFilterCreate",
    {
        "parentFormId": fields.String(
            description="ID of the parent form for which the filter is being created."
        ),
        "variables": fields.List(
            fields.Nested(variable),
            description="List of variables to be used in the filter.",
        ),
        "isDefault": fields.Boolean(
            description="Flag to indicate if this is the default filter.", default=False
        ),
    },
)
analyze_submissions_response_model = API.inherit(
    "AnalyzeSubmissionsResponse",
    analyze_submissions_create_model,
    {
        "id": fields.Integer(
            description="Unique identifier for the filter preference entry."
        ),
        "tenant": fields.String(
            description="Tenant identifier (optional, for multi-tenant support)."
        ),
        "user": fields.String(description="Unique identifier for the user."),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class SubmissionsFilterPreferencesResource(Resource):
    """Resource for managing user filter preferences for analyze submissions."""

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_SUBMISSIONS_VIEW])
    @profiletime
    @API.doc(
        responses={
            201: ("CREATED:- Successful request.", analyze_submissions_response_model),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def post():
        """Create or update user filter preferences for analyze submissions."""
        request_data = request.get_json()
        if not request_data:
            return {"message": "Invalid input"}, HTTPStatus.BAD_REQUEST
        response = SubmissionsFilterService.create_or_update_filter_preferences(
            request_data
        )
        return response, HTTPStatus.CREATED

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_SUBMISSIONS_VIEW])
    @profiletime
    @API.doc(
        responses={
            200: ("OK:- Successful request.", [analyze_submissions_response_model]),
            400: "NOT_FOUND:- No filter preferences found for user.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def get():
        """Get user filter preferences for analyze submissions."""
        response = SubmissionsFilterService.get_user_filter_preferences()
        return response, HTTPStatus.OK


@cors_preflight("GET, DELETE, OPTIONS")
@API.route("/<int:filter_id>", methods=["GET", "DELETE", "OPTIONS"])
class SubmissionsFilterResourceById(Resource):
    """Resource for managing user filter preferences for analyze submissions by ID."""

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_SUBMISSIONS_VIEW])
    @profiletime
    @API.doc(
        responses={
            200: ("OK:- Successful request.", analyze_submissions_response_model),
            404: "NOT_FOUND:- Filter preferences not found for the given ID.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def get(filter_id):
        """Get user filter preferences for analyze submissions by ID."""
        response = SubmissionsFilterService.get_filter_preferences_by_id(
            filter_id
        )
        return response, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_SUBMISSIONS_VIEW])
    @profiletime
    @API.doc(
        responses={
            200: ("OK:- Successful deletion of filter preferences."),
            404: "NOT_FOUND:- Filter preferences not found for the given ID.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        }
    )
    def delete(filter_id):
        """Delete user filter preferences for analyze submissions by ID."""
        response = SubmissionsFilterService.delete_filter_preferences_by_id(
            filter_id
        )
        return response, HTTPStatus.OK

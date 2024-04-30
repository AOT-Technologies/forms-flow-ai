"""API endpoints for filter resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ADMIN_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import ThemeCustomizationSchema
from formsflow_api.services import ThemeCustomizationService

theme_schema = ThemeCustomizationSchema()

API = Namespace("Theme", description="Theme Customization APIs")

theme_model = API.model(
    "Theme",
    {
        "id": fields.Integer(),
        "logoName": fields.String(),
        "logoType": fields.String(),
        "value": fields.String(),
        "applicationTitle": fields.String(),
        "theme": fields.Raw()
    },
)

@cors_preflight("GET, POST,PUT, OPTIONS")
@API.route("", methods=["GET", "POST","PUT", "OPTIONS"])
class ThemeCustomizationResource(Resource):
    """Resource to create theme."""

    @staticmethod
    # @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            201: "CREATED:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=theme_model,
    )
    def post():
        """ Create Theme. """
        print("theme data",request.get_json())
        theme_data = theme_schema.load(request.get_json())
        response, status = (
            ThemeCustomizationService.create_theme(theme_data),
            HTTPStatus.CREATED,
        )
        return response, status

    @staticmethod
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=[theme_model],
    )
    def get():
        """Get theme by tenant key. This is a public API"""
        response, status = ThemeCustomizationService.get_theme(), HTTPStatus.OK
        return response, status

    @staticmethod
    # @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=theme_model,
    )
    def put():
        """
        Update Theme by tenant key.

        Update filter details corresponding to a filter id for requests with ```REVIEWER_GROUP``` permission.
        """
        theme_data = theme_schema.load(request.get_json())
        print("theme data",theme_data)
        theme_result = ThemeCustomizationService.update_theme(theme_data)
        response, status = (
            theme_schema.dump(theme_result),
            HTTPStatus.OK,
        )
        return response, status

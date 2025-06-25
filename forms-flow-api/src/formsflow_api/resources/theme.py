"""API endpoints for theme resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ThemeCustomizationSchema
from formsflow_api.services import ThemeCustomizationService

theme_schema = ThemeCustomizationSchema()

API = Namespace("Themes", description="Theme Customization APIs.")

theme_model = API.model(
    "Themes",
    {
        "logoName": fields.String(),
        "type": fields.String(),
        "value": fields.String(),
        "applicationTitle": fields.String(),
        "themeJson": fields.Raw(),
        "logoData": fields.String(),
    },
)
theme_response_model = API.inherit(
    "ThemeResponse",
    theme_model,
    {
        "id": fields.Integer(),
        "created_by": fields.String(),
        "tenant": fields.String(),
    },
)


@cors_preflight("GET, POST,PUT, OPTIONS")
@API.route("", methods=["GET", "POST", "PUT", "OPTIONS"])
class ThemeCustomizationResource(Resource):
    """Resource to manage create update and get theme."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            201: ("CREATED:- Successful request.", theme_response_model),
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
            403: "FORBIDDEN:- Permission denied",
        }
    )
    @API.expect(theme_model)
    def post():
        """Create Theme."""
        theme_data = theme_schema.load(request.get_json())
        response, status = (
            ThemeCustomizationService.create_theme(theme_data),
            HTTPStatus.CREATED,
        )
        return response, status

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
            403: "FORBIDDEN:- Permission denied",
        },
        model=theme_response_model,
    )
    @API.expect(theme_model)
    def put():
        """Update Theme."""
        theme_data = theme_schema.load(request.get_json())
        theme_result = ThemeCustomizationService.update_theme(theme_data)
        response, status = (
            theme_schema.dump(theme_result),
            HTTPStatus.OK,
        )
        return response, status

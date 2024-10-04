"""API endpoints for managing import."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services import ImportService

API = Namespace("Import", description="Import")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class Import(Resource):
    """Resource to support import."""

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
    def post():
        """Import."""
        import_service = ImportService()
        return (
            import_service.import_form_workflow(request),
            HTTPStatus.OK,
        )

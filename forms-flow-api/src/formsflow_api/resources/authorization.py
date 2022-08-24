"""Resource to get Dashboard APIs from redash."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import AuthorizationService

API = Namespace("authorization", description="Authorization APIs")
auth_service = AuthorizationService()


@cors_preflight("GET, POST, OPTIONS")
@API.route("/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
class AuthorizationList(Resource):
    """Resource to fetch Authorization List and cerate authorization."""

    @staticmethod
    @API.doc("list_authorization")
    @auth.require
    @profiletime
    def get(auth_type: str):
        """List all authorization."""
        return auth_service.get_authorizations(auth_type.upper()), HTTPStatus.OK

    @staticmethod
    @API.doc("list_authorization")
    @auth.require
    @profiletime
    def post(auth_type: str):
        """Create authorization."""
        return (
            auth_service.create_authorization(auth_type.upper(), request.get_json()),
            HTTPStatus.OK,
        )


@cors_preflight("GET, POST, OPTIONS")
@API.route("/users/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
class UserAuthorizationList(Resource):
    """Resource to fetch Authorization List for the current user."""

    @staticmethod
    @API.doc("list_authorization")
    @auth.require
    @profiletime
    def get(auth_type: str):
        """List all authorization for the current user."""
        return auth_service.get_user_authorizations(auth_type.upper()), HTTPStatus.OK

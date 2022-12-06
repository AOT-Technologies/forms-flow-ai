"""Resource to get Dashboard APIs from redash."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import AuthorizationService

API = Namespace("authorization", description="Authorization APIs")
auth_service = AuthorizationService()

resource_details_model = API.model("resource_details", {"name": fields.String()})

authorization_model = API.model(
    "Authorization",
    {
        "resourceId": fields.String(),
        "resourceDetails": fields.Nested(resource_details_model),
        "roles": fields.List(fields.String(), description="Authorized Roles"),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
@API.doc(params={"auth_type": "Type of authorization ```dashboard/form```"})
class AuthorizationList(Resource):
    """Resource to fetch Authorization List and create authorization."""

    @staticmethod
    @API.doc("list_authorization")
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=[authorization_model],
    )
    def get(auth_type: str):
        """
        List all authorization.

        Get all authorizations based on authorization type.
        """
        return auth_service.get_authorizations(auth_type.upper()), HTTPStatus.OK

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            201: "CREATED:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=authorization_model,
    )
    @API.expect(authorization_model)
    def post(auth_type: str):
        """
        Create authorization.

        Create authorization based on authorization type.
        e.g payload ,
        auth_type: form
        ```
        {
            "resourceId": "63314e04674cdcaca7caace2",
            "resourceDetails": {},
            "roles": [
                "/formsflow/formsflow-reviewer",
                "/formsflow/formsflow-client"
            ]
        }
        ```
        auth_type: dashboard
        ```
        {
            "resourceId":"5",
            "resourceDetails":{"name":"New Business License Application"},
            "roles":["/formsflow-analytics/group1"]
        }
        ```
        """
        return (
            auth_service.create_authorization(auth_type.upper(), request.get_json()),
            HTTPStatus.OK,
        )


@cors_preflight("GET, POST, OPTIONS")
@API.route("/users/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
@API.doc(params={"auth_type": "Type of authorization ```dashboard/form```"})
class UserAuthorizationList(Resource):
    """Resource to fetch Authorization List for the current user."""

    @staticmethod
    @API.doc("list_authorization")
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=[authorization_model],
    )
    def get(auth_type: str):
        """
        List all authorization for the current user.

        List all authorization for the current user based on authorization type.
        """
        return auth_service.get_user_authorizations(auth_type.upper()), HTTPStatus.OK

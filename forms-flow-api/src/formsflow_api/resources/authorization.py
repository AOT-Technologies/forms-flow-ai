"""Resource to get Dashboard APIs from redash."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import AuthType
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

authorization_list_model = API.model(
    "Authorization List",
    {
        "APPLICATION": fields.Nested(authorization_model),
        "FORM": fields.Nested(authorization_model),
        "DESIGNER": fields.Nested(authorization_model),
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
            auth_service.create_authorization(
                auth_type.upper(),
                request.get_json(),
                bool(auth.has_role([DESIGNER_GROUP])),
            ),
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


@cors_preflight("GET, OPTIONS")
@API.route("/<string:auth_type>/<string:resource_id>", methods=["GET", "OPTIONS"])
@API.doc(
    params={
        "auth_type": "Type of authorization",
        "resource_id": "Authorization Details corresponding to resource id.",
    }
)
class AuthorizationDetail(Resource):
    """Resource to fetch Authorization Details corresponding to resource id."""

    @staticmethod
    @API.doc("Authorization detail by Id")
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=authorization_model,
    )
    def get(auth_type: str, resource_id: str):
        """
        Fetch Authorization details by resource id.

        Fetch Authorization details by resource id based on authorization type.
        """
        response = auth_service.get_resource_by_id(
            auth_type.upper(), resource_id, bool(auth.has_role([DESIGNER_GROUP]))
        )
        if response:
            return (
                response,
                HTTPStatus.OK,
            )
        return {"message": "Permission denied"}, HTTPStatus.UNAUTHORIZED


@cors_preflight("GET, OPTIONS")
@API.route("/resource/<string:resource_id>", methods=["GET", "POST", "OPTIONS"])
@API.doc(
    params={
        "resource_id": "Authorization list corresponding to resource id.",
    }
)
class AuthorizationListById(Resource):
    """Resource to fetch Authorization List corresponding to resource id."""

    @staticmethod
    @API.doc("Authorization list by Id")
    @auth.has_one_of_roles([DESIGNER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=authorization_list_model,
    )
    def get(resource_id: str):
        """Fetch Authorization list by resource id."""
        response = auth_service.get_auth_list_by_id(resource_id)
        if response:
            return (
                response,
                HTTPStatus.OK,
            )

        raise BusinessException(BusinessErrorCode.INVALID_AUTH_RESOURCE_ID)

    @staticmethod
    @API.doc("Authorization create by Id")
    @auth.has_one_of_roles([DESIGNER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=authorization_list_model,
    )
    def post(resource_id: str):
        """Create or Update Authoization of Form by id."""
        data = request.get_json()
        for auth_type in AuthType:
            if (
                data.get(auth_type.value.lower())
                and auth_type.value != AuthType.DASHBOARD.value
            ):
                auth_service.create_authorization(
                    auth_type.value.upper(),
                    data.get(auth_type.value.lower()),
                    bool(auth.has_role([DESIGNER_GROUP])),
                )
        response = auth_service.get_auth_list_by_id(resource_id)
        if response:
            return (
                response,
                HTTPStatus.OK,
            )
        raise BusinessException(BusinessErrorCode.INVALID_AUTH_RESOURCE_ID)

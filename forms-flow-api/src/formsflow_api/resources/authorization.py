"""Resource to get Dashboard APIs from redash."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    VIEW_DASHBOARDS,
    VIEW_DESIGNS,
    VIEW_SUBMISSIONS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import AuthorizationService

API = Namespace("Authorization", description="Authorization APIs")
auth_service = AuthorizationService()

resource_details_model = API.model("resource_details", {"name": fields.String()})

authorization_model = API.model(
    "Authorization",
    {
        "resourceId": fields.String(),
        "resourceDetails": fields.Nested(resource_details_model),
        "roles": fields.List(fields.String(), description="Authorized Roles"),
        "userName": fields.String(description="UserName can be null or string"),
    },
)

authorization_list_model = API.model(
    "AuthorizationList",
    {
        "APPLICATION": fields.Nested(authorization_model),
        "FORM": fields.Nested(authorization_model),
        "DESIGNER": fields.Nested(authorization_model),
    },
)


@cors_preflight("GET, POST, OPTIONS")
@API.route("/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
@API.doc(
    params={
        "auth_type": "Type of authorization ```dashboard/form/application/designer```"
    }
)
class AuthorizationList(Resource):
    """Resource to fetch Authorization List and create authorization."""

    @staticmethod
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
                bool(auth.has_role([CREATE_DESIGNS])),
            ),
            HTTPStatus.OK,
        )


@cors_preflight("GET, POST, OPTIONS")
@API.route("/users/<string:auth_type>", methods=["GET", "POST", "OPTIONS"])
@API.doc(
    params={
        "auth_type": "Type of authorization ```dashboard/form/application/designer```"
    }
)
class UserAuthorizationList(Resource):
    """Resource to fetch Authorization List for the current user."""

    @staticmethod
    @auth.has_one_of_roles([VIEW_DASHBOARDS])
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

        List authorizations for the current user based on authorization type.
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
    @auth.has_one_of_roles(
        [CREATE_DESIGNS, VIEW_DESIGNS, CREATE_SUBMISSIONS, VIEW_SUBMISSIONS]
    )
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
        if auth_type.upper() == "APPLICATION":
            response = auth_service.get_application_resource_by_id(
                auth_type=auth_type.upper(),
                resource_id=resource_id,
                form_id=request.args.get("formId"),
            )
        else:
            response = auth_service.get_resource_by_id(
                auth_type.upper(),
                resource_id,
                bool(auth.has_role([CREATE_DESIGNS])),
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
    @auth.has_one_of_roles([CREATE_DESIGNS, VIEW_DESIGNS])
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
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=authorization_list_model,
    )
    @API.expect(authorization_list_model)
    def post(resource_id: str):
        """Create or Update Authoization of Form by id."""
        data = request.get_json()
        AuthorizationService.create_or_update_resource_authorization(
            data, bool(auth.has_role([CREATE_DESIGNS]))
        )
        response = auth_service.get_auth_list_by_id(resource_id)
        if response:
            return (
                response,
                HTTPStatus.OK,
            )
        raise BusinessException(BusinessErrorCode.INVALID_AUTH_RESOURCE_ID)

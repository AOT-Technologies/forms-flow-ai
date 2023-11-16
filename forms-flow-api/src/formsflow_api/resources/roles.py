"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ADMIN_GROUP,
    DESIGNER_GROUP,
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import RolesGroupsSchema
from formsflow_api.services.factory import KeycloakFactory

roles_schema = RolesGroupsSchema()

API = Namespace("roles", description="keycloak roles wrapper APIs")

roles_request = API.model(
    "roles_request",
    {
        "name": fields.String(),
        "description": fields.String(),
    },
)

roles_response = API.inherit("roles_response", roles_request, {"id": fields.String()})


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class KeycloakRolesResource(Resource):
    """Resource to manage keycloak list and create roles/groups."""

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP, DESIGNER_GROUP, REVIEWER_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=[roles_response],
    )
    def get():
        """
        GET request to fetch all groups/roles from Keycloak.

        :params int pageNo: page number (optional)
        :params int limit: number of items per page (optional)
        """
        search = request.args.get("search", "")
        sort_order = request.args.get("sortOrder", "asc")
        response = KeycloakFactory.get_instance().get_groups_roles(search, sort_order)
        response = roles_schema.dump(response, many=True)
        return response, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            201: "CREATED:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
    )
    @API.expect(roles_request)
    def post():
        """Create role/group in keycloak."""
        request_data = roles_schema.load(request.get_json())
        response, status = (
            KeycloakFactory.get_instance().create_group_role(request_data),
            HTTPStatus.CREATED,
        )
        return response, status


@cors_preflight("GET, PUT, DELETE, OPTIONS")
@API.route("/<string:role_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@API.doc(params={"role_id": "Group/Role details corresponding to group_id/role name"})
class KeycloakRolesResourceById(Resource):
    """Resource to manage keycloak roles/groups by id."""

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=roles_response,
    )
    def get(role_id: str):
        """
        Get role by group id/role name.

        Get keycloak role by role name & group by group id.
        """
        response = KeycloakFactory.get_instance().get_group(role_id)
        response = roles_schema.dump(response)
        return response, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
    )
    def delete(role_id: str):
        """
        Delete role by role id.

        Delete keycloak role by role name & group by group id.
        """
        KeycloakFactory.get_instance().delete_group(role_id)
        return {"message": "Deleted successfully."}, HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
    )
    @API.expect(roles_request)
    def put(role_id: str):
        """
        Update role by role id.

        Update keycloak role by role name & group by group id.
        """
        request_data = roles_schema.load(request.get_json())
        response = KeycloakFactory.get_instance().update_group(role_id, request_data)
        return {"message": response}, HTTPStatus.OK

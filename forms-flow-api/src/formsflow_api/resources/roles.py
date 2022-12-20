"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

import requests
from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from marshmallow.exceptions import ValidationError

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
    @auth.require
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
        try:
            search = request.args.get("search", "")
            sort_order = request.args.get("sortOrder", "asc")
            response = KeycloakFactory.get_instance().get_groups_roles(
                search, sort_order
            )
            response = roles_schema.dump(response, many=True)
            return response, HTTPStatus.OK
        except requests.exceptions.RequestException as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

    @staticmethod
    @auth.require
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
        try:
            request_data = roles_schema.load(request.get_json())
            response, status = (
                KeycloakFactory.get_instance().create_group_role(request_data),
                HTTPStatus.CREATED,
            )
            return response, status
        except ValidationError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
            return response, status
        except requests.exceptions.HTTPError as err:
            current_app.logger.warning(err)
            message = "Invalid request data"
            if err.response.status_code == 409:
                message = "Role name already exists."
            return {
                "type": "Bad request error",
                "message": message,
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error


@cors_preflight("GET, POST, OPTIONS")
@API.route("/<string:role_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@API.doc(params={"role_id": "Group/Role details corresponding to group_id/role name"})
class KeycloakRolesResourceById(Resource):
    """Resource to manage keycloak roles/groups by id."""

    @staticmethod
    @auth.require
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
        try:
            response = KeycloakFactory.get_instance().get_group(role_id)
            response = roles_schema.dump(response)
            return response, HTTPStatus.OK
        except requests.exceptions.HTTPError as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid role_id",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

    @staticmethod
    @auth.require
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
        try:
            KeycloakFactory.get_instance().delete_group(role_id)
            return {"message": "Deleted successfully."}, HTTPStatus.OK
        except requests.exceptions.HTTPError as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid role_id",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

    @staticmethod
    @auth.require
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
        try:
            request_data = roles_schema.load(request.get_json())
            response = KeycloakFactory.get_instance().update_group(
                role_id, request_data
            )
            return {"message": response}, HTTPStatus.OK
        except requests.exceptions.HTTPError as err:
            current_app.logger.warning(err)
            message = "Invalid role_id"
            if err.response.status_code == 409:
                message = "Role name already exists."
            return {
                "type": "Bad request error",
                "message": message,
            }, HTTPStatus.BAD_REQUEST
        except ValidationError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
            return response, status
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

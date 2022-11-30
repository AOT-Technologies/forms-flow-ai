"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

import requests
from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services.factory import KeycloakFactory

API = Namespace("roles", description="keycloak roles wrapper APIs")


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
        }
    )
    def get():
        """
        GET request to fetch all groups/roles from Keycloak.

        :params int pageNo: page number (optional)
        :params int limit: number of items per page (optional)
        """
        try:
            if request.args:
                dict_data = ApplicationListReqSchema().load(request.args)
                page_no = dict_data.get("page_no", 1)
                limit = dict_data("limit", 10)
            else:
                page_no = 0
                limit = 0
            group_response = KeycloakFactory.get_instance().get_groups_roles(
                page_no, limit
            )
            return group_response, HTTPStatus.OK
        except requests.exceptions.RequestException as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error


@cors_preflight("GET, POST, OPTIONS")
@API.route("/<string:role_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class KeycloakRolesResourceById(Resource):
    """Resource to manage keycloak roles/groups by id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(role_id: str):
        """
        Get role by role id.

        Get keycloak role/group by id.
        """
        try:
            role_response = KeycloakFactory.get_instance().get_group(role_id)
            return role_response, HTTPStatus.OK
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
    def delete(role_id: str):
        """
        Delete role by role id.

        Delete keycloak role/group by id.
        """
        try:
            KeycloakFactory.get_instance().delete_group(role_id)
            return "Role deleted successfully.", HTTPStatus.NO_CONTENT
        except requests.exceptions.HTTPError as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid role_id",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

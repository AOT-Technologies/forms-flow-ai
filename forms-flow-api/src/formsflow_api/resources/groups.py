"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus
from pprint import pprint

from flask import current_app, request
from flask_restx import Namespace, Resource
from marshmallow import ValidationError

from formsflow_api.schemas import (
    ApplicationListReqSchema,
    KeycloakDashboardGroupSchema,
)
from formsflow_api.services import KeycloakAdminAPIService
from formsflow_api.utils import auth, cors_preflight, profiletime

API = Namespace("groups", description="Keycloak wrapper APIs")


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class KeycloakDashboardGroupList(Resource):
    """Resource to fetch Dashboard List."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """GET request to fetch all dashboard groups from Keycloak.

        :params int pageNo: page number (optional)
        :params int limit: number of items per page (optional)
        """
        client = KeycloakAdminAPIService()
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0
        # If keycloak client level authorization is enabled; search roles under the client.
        if current_app.config.get("KEYCLOAK_ENABLE_CLIENT_AUTH"):
            dashboard_group_list = client.get_analytics_roles(page_no, limit)
        else:
            dashboard_group_list = client.get_analytics_groups(page_no, limit)
        if not dashboard_group_list:
            return {
                "message": "No Dashboard authorized Group found"
            }, HTTPStatus.NOT_FOUND

        return dashboard_group_list, HTTPStatus.OK


@cors_preflight("GET,PUT,OPTIONS")
@API.route("/<string:group_id>", methods=["GET", "PUT", "OPTIONS"])
class KeycloakDashboardGroupDetail(Resource):
    """Keycloak dashboard group detail class."""

    @staticmethod
    @auth.require
    @profiletime
    def get(group_id):
        """GET request to fetch groups details API.

        :params str id: group-id of Keycloak Dashboard Authorized groups
        """
        client = KeycloakAdminAPIService()
        response = client.get_request(url_path=f"groups/{group_id}")
        if response is None:
            return {"message": f"Group - {group_id} not found"}, HTTPStatus.NOT_FOUND
        return response

    @staticmethod
    @auth.require
    @profiletime
    def put(group_id):
        """Update request to update dashboard details.

        :params str id: group-id of Keycloak Dashboard Authorized groups
        """
        client = KeycloakAdminAPIService()
        group_json = request.get_json()
        try:
            dict_data = KeycloakDashboardGroupSchema().load(group_json)

            dashboard_id_details = client.get_request(url_path=f"groups/{group_id}")
            if dashboard_id_details is None:
                return {
                    "message": f"Group - {group_id} not found"
                }, HTTPStatus.NOT_FOUND

            dashboard_id_details["attributes"]["dashboards"] = [
                str(dict_data["dashboards"])
            ]
            response = client.update_request(
                url_path=f"groups/{group_id}", data=dashboard_id_details
            )
            if response is None:
                return {
                    "message": f"Group - {group_id} not updated successfully"
                }, HTTPStatus.SERVICE_UNAVAILABLE
            return response
        except ValidationError as err:
            pprint(err.messages)
            return {"message": "Invalid Request Object format"}, HTTPStatus.BAD_REQUEST

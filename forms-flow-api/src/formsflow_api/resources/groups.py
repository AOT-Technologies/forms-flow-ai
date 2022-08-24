"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services.factory import KeycloakFactory

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
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0
        dashboard_group_list = KeycloakFactory.get_instance().get_analytics_groups(
            page_no, limit
        )

        if not dashboard_group_list:
            return {
                "message": "No Dashboard authorized Group found"
            }, HTTPStatus.NOT_FOUND

        return dashboard_group_list, HTTPStatus.OK

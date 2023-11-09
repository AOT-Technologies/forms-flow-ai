"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services.factory import KeycloakFactory

API = Namespace("groups", description="Keycloak wrapper APIs")

groups_list_model = API.model(
    "Group",
    {
        "id": fields.Integer(),
        "name": fields.String(),
        "path": fields.String(),
        "subGroups": fields.List(fields.String()),
    },
)


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class KeycloakDashboardGroupList(Resource):
    """Resource to fetch Dashboard List."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number which starts from number 1 (optional).",
                "default": "",
            },
            "limit": {
                "in": "query",
                "description": "Number of items per page (optional).",
                "default": "",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=[groups_list_model])
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        404,
        "NOT_FOUND:- Resource not found.",
    )
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
            raise BusinessException(BusinessErrorCode.NO_DASHBOARD_AUTHORIZED)

        return dashboard_group_list, HTTPStatus.OK

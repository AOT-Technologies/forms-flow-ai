"""Resource to get Dashboard APIs from redash."""
import re
from http import HTTPStatus

from flask import g, request
from flask_restx import Namespace, Resource

from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services import RedashAPIService
from formsflow_api.utils import auth, cors_preflight, profiletime

API = Namespace("dashboards", description="Dashboard APIs")
analytics_service = RedashAPIService()


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class DashboardList(Resource):
    """Resource to fetch Dashboard List.

    : pageNo:- page number which starts from number 1 (optional)
    : limit:- number of items per page (optional)
    """

    @staticmethod
    @API.doc("list_dashboards")
    @auth.require
    @profiletime
    def get():
        """List all dashboards."""
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = None
            limit = None
        response = analytics_service.get_request(
            url_path="dashboards", page_no=page_no, limit=limit
        )
        if response == "unauthorized":
            return {"message": "Dashboard not found"}, HTTPStatus.NOT_FOUND
        if response is None:
            return {"message": "Error"}, HTTPStatus.SERVICE_UNAVAILABLE

        assert response is not None
        return response, HTTPStatus.OK


@cors_preflight("GET,OPTIONS")
@API.route("/<int:dashboard_id>", methods=["GET", "OPTIONS"])
class DashboardDetail(Resource):
    """Resource to fetch Dashboard Detail."""

    @staticmethod
    @API.doc("get_dashboard")
    @auth.require
    @profiletime
    def get(dashboard_id: int):
        """Get  dashboard.

        : dashboard_id:- Get dashboard with given dashboard_id
        """
        try:
            available_dashboards = re.findall(
                r"\d+", str(g.token_info.get("dashboards"))
            )

            available_dashboards.index(str(dashboard_id))
        except ValueError:
            return {
                "message": f"Dashboard - {dashboard_id} not accessible"
            }, HTTPStatus.FORBIDDEN
        else:
            # code run in case of no exception
            response = analytics_service.get_request(
                url_path=f"dashboards/{dashboard_id}"
            )
            if response == "unauthorized":
                return {"message": "Dashboard not found"}, HTTPStatus.NOT_FOUND
            if response is None:
                return {"message": "Error"}, HTTPStatus.SERVICE_UNAVAILABLE

            assert response is not None
            return response, HTTPStatus.OK

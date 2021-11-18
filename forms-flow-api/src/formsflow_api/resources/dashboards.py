"""Resource to get Dashboard APIs from redash"""
from http import HTTPStatus
from flask_restx import Namespace, Resource
from formsflow_api.services import RedashAPIService
from formsflow_api.utils import auth, profiletime, cors_preflight

API = Namespace("dashboards", description="Dashboard APIs")
analytics_service = RedashAPIService()


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class DashboardList(Resource):
    """Resource to fetch Dashboard List"""

    @API.doc("list_dashboards")
    @auth.require
    @profiletime
    def get(self):
        """List all dashboards"""
        return analytics_service.get_request(url_path="dashboards")


@cors_preflight("GET,OPTIONS")
@API.route("/<int:dashboard_id>", methods=["GET", "OPTIONS"])
class DashboardDetail(Resource):
    """Resource to fetch Dashboard Detail"""

    @API.doc("get_dashboard")
    @auth.require
    @profiletime
    def get(self, dashboard_id):
        """Get a dashboard with given dashboard_id"""
        response = analytics_service.get_request(url_path=f"dashboards/{dashboard_id}")
        if response is None:
            return {"message": "Dashboard not found"}, HTTPStatus.NOT_FOUND
        else:
            assert response != None
            return response

"""Resource to get Dashboard APIs from redash."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services import AuthorizationService, RedashAPIService

API = Namespace("dashboards", description="Dashboard APIs")
analytics_service = RedashAPIService()
auth_service = AuthorizationService()


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
        try:
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
                return {"message": "Permission Denied"}, HTTPStatus.UNAUTHORIZED
            if response is None:
                return {"message": "Error"}, HTTPStatus.SERVICE_UNAVAILABLE

            assert response is not None
            return response, HTTPStatus.OK
        except Exception as err:  # pylint: disable=broad-except
            response, status = {
                "type": "Connection Refused",
                "message": "Failed to establish connection with analytics",
            }, HTTPStatus.BAD_GATEWAY
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status


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
        if not auth_service.is_dashboard_authorized(resource_id=dashboard_id):
            return {
                "message": f"Dashboard - {dashboard_id} not accessible"
            }, HTTPStatus.FORBIDDEN

        # code run in case of no exception
        response = analytics_service.get_request(
            url_path=f"dashboards/{dashboard_id}?return_dynamic_key=true"
        )
        if response == "unauthorized":
            return {"message": "Permission Denied"}, HTTPStatus.UNAUTHORIZED
        if response is None:
            return {"message": "Error"}, HTTPStatus.SERVICE_UNAVAILABLE

        assert response is not None
        return response, HTTPStatus.OK

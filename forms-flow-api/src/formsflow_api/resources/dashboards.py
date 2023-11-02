"""Resource to get Dashboard APIs from redash."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationListReqSchema
from formsflow_api.services import AuthorizationService, RedashAPIService

API = Namespace("dashboards", description="Dashboard APIs")
analytics_service = RedashAPIService()
auth_service = AuthorizationService()

dashboard_base_model = API.model(
    "DashboardBase",
    {
        "created_at": fields.String(),
        "dashboard_filters_enabled": fields.Boolean(),
        "id": fields.Integer(),
        "is_archived": fields.Boolean(),
        "is_draft": fields.Boolean(),
        "is_favorite": fields.Boolean(),
        "layout": fields.List(fields.Raw()),
        "name": fields.String(),
        "options": fields.Raw(),
        "tags": fields.List(fields.String()),
        "updated_at": fields.String(),
        "user": fields.Nested(
            API.model(
                "User",
                {
                    "email": fields.String(),
                    "id": fields.Integer(),
                    "name": fields.String(),
                    "profile_image_url": fields.String(),
                },
            )
        ),
        "user_id": fields.Integer(),
        "version": fields.Integer(),
    },
)

dashboard_model = API.inherit(
    "Dashboard",
    dashboard_base_model,
    {
        "slug": fields.String(),
        "can_edit": fields.Boolean(),
        "widgets": fields.List(fields.Raw()),
        "dashboard_filters_enabled": fields.Boolean(),
    },
)

dashboard_list_model = API.model(
    "DashboardList",
    {
        "results": fields.List(fields.Nested(dashboard_base_model)),
        "count": fields.Integer(),
        "page": fields.Integer(),
        "page_size": fields.Integer(),
    },
)


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class DashboardList(Resource):
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
    @API.response(200, "OK:- Successful request.", model=dashboard_list_model)
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        502,
        "BAD_GATEWAY:- Invalid response from another service.",
    )
    @API.response(
        503,
        "SERVICE_UNAVAILABLE:- Server cannot process te request.",
    )
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
            return {"message": "Permission Denied"}, HTTPStatus.UNAUTHORIZED
        if response is None:
            return {"message": "Error"}, HTTPStatus.SERVICE_UNAVAILABLE

        assert response is not None
        return response, HTTPStatus.OK


@cors_preflight("GET,OPTIONS")
@API.route("/<int:dashboard_id>", methods=["GET", "OPTIONS"])
class DashboardDetail(Resource):
    """Resource to fetch Dashboard Detail."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=dashboard_model)
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    @API.response(
        502,
        "BAD_GATEWAY:- Invalid response from another service.",
    )
    @API.response(
        503,
        "SERVICE_UNAVAILABLE:- Server cannot process te request.",
    )
    def get(dashboard_id: int):
        """Get dashboard by id."""
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

"""API endpoints for metrics resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ANALYZE_METRICS_VIEW,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas.aggregated_application import (
    ApplicationMetricsRequestSchema,
)
from formsflow_api.services import ApplicationService as AS

API = Namespace("Metrics", description="Endpoints for retrieving application metrics.")

version_model = API.model(
    "FormVersions",
    {
        "formId": fields.String(),
        "version": fields.Integer(),
    },
)

metrics_model = API.model(
    "Metrics",
    {
        "formversions": fields.List(fields.Nested(version_model)),
        "formName": fields.String(),
        "parentFormId": fields.Integer(),
        "applicationCount": fields.String(),
    },
)

metrics_list_model = API.model(
    "MetricsList",
    {
        "applications": fields.List(fields.Nested(metrics_model)),
        "limit": fields.Integer(),
        "pageNo": fields.Integer(),
        "totalCount": fields.Integer(),
    },
)

metrics_detail_model = API.model(
    "MetricsDetail",
    {
        "applications": fields.List(
            fields.Nested(
                API.model(
                    "MetricsDetailMapper",
                    {
                        "count": fields.Integer(),
                        "statusName": fields.String(),
                    },
                )
            )
        )
    },
)


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_METRICS_VIEW])
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
                "default": "1",
            },
            "limit": {
                "in": "query",
                "description": "Limit for paginated results",
                "default": "5",
            },
            "from": {
                "in": "query",
                "description": "From date for metrics filter.",
                "default": "2024-12-31T18:30:00+00:00",
            },
            "to": {
                "in": "query",
                "description": "To date for metrics filter.",
                "default": "2025-02-01T18:30:00+00:00",
            },
            "sortBy": {
                "in": "query",
                "description": "Specify field for sorting the results.",
                "default": "formName",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
            },
            "orderBy": {
                "in": "query",
                "description": "Specifies whether to filter records by modified or created timestamp \
                                within the provided date range (from and to).",
                "default": "created",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=metrics_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get():
        """Get aggregated applications."""
        request_schema = ApplicationMetricsRequestSchema()
        dict_data = request_schema.load(request.args)
        from_date = dict_data["from_date"]
        to_date = dict_data["to_date"]
        order_by = dict_data.get("order_by")
        page_no = dict_data.get("page_no")
        limit = dict_data.get("limit")
        form_name = dict_data.get("form_name")
        sort_by = dict_data.get("sort_by")
        sort_order = dict_data.get("sort_order")
        if form_name:
            form_name: str = form_name.replace("%", r"\%").replace("_", r"\_")
        metrics_schema, metrics_count = AS.get_aggregated_applications(
            from_date=from_date,
            to_date=to_date,
            page_no=page_no,
            limit=limit,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
            order_by=order_by,
        )
        return (
            {
                "applications": metrics_schema,
                "totalCount": metrics_count,
                "pageNo": page_no,
                "limit": limit,
            }
        ), HTTPStatus.OK


@cors_preflight("GET,OPTIONS")
@API.route("/<string:form_id>", methods=["GET", "OPTIONS"])
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @auth.has_one_of_roles([ANALYZE_METRICS_VIEW])
    @profiletime
    @API.doc(
        params={
            "from": {
                "in": "query",
                "description": "From date for metrics filter.",
                "default": "2024-12-31T18:30:00+00:00",
            },
            "to": {
                "in": "query",
                "description": "To date for metrics filter.",
                "default": "2025-02-01T18:30:00+00:00",
            },
            "orderBy": {
                "in": "query",
                "description": "Specifies whether to filter records by modified or created timestamp \
                                within the provided date range (from and to).",
                "default": "created",
            },
            "formType": {
                "in": "query",
                "description": "Determines whether to filter by form_id or parent_form_id \
                                based on the provided formType(form/parent).",
                "default": "form",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=metrics_detail_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    def get(form_id):
        """
        Get application metrics corresponding to a form_id.

        Get summarized application status data with counts, filtered by form_id or parent_form_id.
        """
        request_schema = ApplicationMetricsRequestSchema()
        dict_data = request_schema.load(request.args)
        from_date = dict_data["from_date"]
        to_date = dict_data["to_date"]
        order_by = dict_data.get("order_by")
        form_type = dict_data.get("form_type")
        if form_type == "parent":
            response, status = (
                (
                    {
                        "applications": AS.get_applications_status_by_parent_form_id(
                            parent_form_id=form_id,
                            from_date=from_date,
                            to_date=to_date,
                            order_by=order_by,
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        else:
            response, status = (
                (
                    {
                        "applications": AS.get_applications_status_by_form_id(
                            form_id=form_id,
                            from_date=from_date,
                            to_date=to_date,
                            order_by=order_by,
                        )
                    }
                ),
                HTTPStatus.OK,
            )

        return response, status

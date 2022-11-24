"""API endpoints for metrics resource."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from formsflow_api_utils.utils.enums import MetricsState
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas.aggregated_application import (
    ApplicationMetricsRequestSchema,
)
from formsflow_api.services import ApplicationService as AS

API = Namespace("Metrics", description="Application Metrics endpoint")

metrics_model = API.model(
    "Metrics",
    {
        "count": fields.Integer(),
        "formName": fields.String(),
        "mapperId": fields.Integer(),
        "version": fields.String(),
    },
)

metrics_list_model = API.model(
    "Metrics List",
    {
        "applications": fields.List(fields.Nested(metrics_model)),
        "limit": fields.Integer(),
        "pageNo": fields.Integer(),
        "totalCount": fields.Integer(),
    },
)

metrics_detail_model = API.model(
    "Metrics detail",
    {
        "applications": fields.List(
            fields.Nested(
                API.model(
                    "Metrics detail mapper",
                    {
                        "applicationName": fields.String(),
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
    @auth.require
    @profiletime
    @API.doc(
        params={
            "from": {
                "in": "query",
                "description": "From date for metrics filter.",
                "default": "1",
            },
            "to": {
                "in": "query",
                "description": "To date for metrics filter.",
                "default": "5",
            },
            "orderBy": {
                "in": "query",
                "description": "Specify field for sorting the results.",
                "default": "id",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
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
        try:
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
            if order_by == MetricsState.MODIFIED.value:
                metrics_schema, metrics_count = AS.get_aggregated_applications_modified(
                    from_date=from_date,
                    to_date=to_date,
                    page_no=page_no,
                    limit=limit,
                    form_name=form_name,
                    sort_by=sort_by,
                    sort_order=sort_order,
                )
            else:
                metrics_schema, metrics_count = AS.get_aggregated_applications(
                    from_date=from_date,
                    to_date=to_date,
                    page_no=page_no,
                    limit=limit,
                    form_name=form_name,
                    sort_by=sort_by,
                    sort_order=sort_order,
                )
            return (
                {
                    "applications": metrics_schema,
                    "totalCount": metrics_count,
                    "pageNo": page_no,
                    "limit": limit,
                }
            ), HTTPStatus.OK
        except ValidationError as metrics_err:
            response = {
                "message": (
                    "Missing from_date or to_date. Invalid"
                    "request object for application metrics endpoint"
                ),
                "errors": "Bad request error",
            }

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, HTTPStatus.BAD_REQUEST

        except Exception as metrics_err:  # pylint: disable=broad-except
            response, status = {
                "message": "Error while getting application metrics",
                "errors": metrics_err,
            }, HTTPStatus.INTERNAL_SERVER_ERROR

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/<int:mapper_id>", methods=["GET", "OPTIONS"])
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "from": {
                "in": "query",
                "description": "From date for metrics filter.",
                "default": "1",
            },
            "to": {
                "in": "query",
                "description": "To date for metrics filter.",
                "default": "5",
            },
            "orderBy": {
                "in": "query",
                "description": "Specify field for sorting the results.",
                "default": "id",
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
    def get(mapper_id):
        """
        Get application metrics corresponding to a mapper_id.

        : mapper_id:- Get aggregated application status.
        """
        try:
            request_schema = ApplicationMetricsRequestSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data["from_date"]
            to_date = dict_data["to_date"]
            order_by = dict_data.get("order_by")

            if order_by == MetricsState.MODIFIED.value:
                response, status = (
                    (
                        {
                            "applications": AS.get_applications_status_modified(
                                mapper_id=mapper_id,
                                from_date=from_date,
                                to_date=to_date,
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )

            else:
                response, status = (
                    (
                        {
                            "applications": AS.get_applications_status(
                                mapper_id=mapper_id,
                                from_date=from_date,
                                to_date=to_date,
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )
            return response, status
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {mapper_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except ValidationError as metrics_err:
            response, status = {
                "message": (
                    "Missing from_date or to_date. Invalid"
                    "request object for application metrics endpoint"
                ),
                "errors": metrics_err,
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, status

        except Exception as metrics_err:  # pylint: disable=broad-except
            response, status = {
                "message": "Error while getting application metrics",
                "errors": metrics_err,
            }, HTTPStatus.INTERNAL_SERVER_ERROR

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, status

"""API endpoints for metrics resource."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from formsflow_api_utils.utils.enums import MetricsState
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas.aggregated_application import (
    ApplicationMetricsRequestSchema,
)
from formsflow_api.services import ApplicationService as AS

API = Namespace("Metrics", description="Application Metrics endpoint")


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications.

    : from:- To retrieve applications based on from_date
    : to:- To retrieve applications based on to_date
    : orderBy:- Name of column to order by
    """

    @staticmethod
    @auth.require
    @profiletime
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
@API.doc(params={"mapper_id": "Metrics corresponding to FormProcess mapperId"})
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @auth.require
    @profiletime
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

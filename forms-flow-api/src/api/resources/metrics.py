"""API endpoints for metrics resource"""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from marshmallow.exceptions import ValidationError

from api.schemas.aggregated_application import ApplicationMetricsRequestSchema
from api.services import ApplicationService
from api.utils import auth, cors_preflight, profiletime, METRICS_MODIFIED


API = Namespace("Metrics", description="Application Metrics endpoint")


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications."""

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

            if order_by == METRICS_MODIFIED:
                return (
                    (
                        {
                            "applications": ApplicationService.get_current_aggregated_applications(
                                from_date=from_date, to_date=to_date
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )

            else:
                return (
                    (
                        {
                            "applications": ApplicationService.get_aggregated_applications(
                                from_date=from_date, to_date=to_date
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )
        except ValidationError as metrics_err:
            response = {
                "message": "Missing from_date or to_date. Invalid request object for application metrics endpoint",
                "errors": metrics_err,
            }

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, HTTPStatus.BAD_REQUEST

        except Exception as metrics_err:
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
        """Get aggregated application status."""
        try:
            request_schema = ApplicationMetricsRequestSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data["from_date"]
            to_date = dict_data["to_date"]
            order_by = dict_data.get("order_by")

            if order_by == METRICS_MODIFIED:
                return (
                    (
                        {
                            "applications": ApplicationService.get_current_aggregated_application_status(
                                mapper_id=mapper_id,
                                from_date=from_date,
                                to_date=to_date,
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )

            else:
                return (
                    (
                        {
                            "applications": ApplicationService.get_aggregated_application_status(
                                mapper_id=mapper_id,
                                from_date=from_date,
                                to_date=to_date,
                            )
                        }
                    ),
                    HTTPStatus.OK,
                )
        except ValidationError as metrics_err:
            response, status = {
                "message": "Missing from_date or to_date. Invalid request object for application metrics endpoint",
                "errors": metrics_err,
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, status

        except Exception as metrics_err:
            response, status = {
                "message": "Error while getting application metrics",
                "errors": metrics_err,
            }, HTTPStatus.INTERNAL_SERVER_ERROR

            current_app.logger.warning(response)
            current_app.logger.warning(metrics_err)
            return response, status

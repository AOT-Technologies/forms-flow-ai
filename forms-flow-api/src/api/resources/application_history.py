"""API endpoints for managing application resource."""

from http import HTTPStatus
import logging

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas.aggregated_application import AggregatedApplicationReqSchema
from ..schemas.application_audit import ApplicationAuditSchema
from ..services import ApplicationService, ApplicationAuditService
from api.utils.auth import auth
from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS

# keeping the base path same for application history and application/
API = Namespace("Application", description="Application")


@cors_preflight("GET,OPTIONS")
@API.route("/<string:application_id>/history", methods=["GET", "POST", "OPTIONS"])
class ApplicationHistoryResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS)
    @auth.require
    def get(application_id):
        """Get application histry."""
        return (
            jsonify(
                {
                    "applications": ApplicationAuditService.get_application_history(
                        application_id=application_id
                    )
                }
            ),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS)
    @auth.require
    def post(application_id):
        """Post a new application using the request body."""
        application_history_json = request.get_json()

        try:
            application_history_schema = ApplicationAuditSchema()
            dict_data = application_history_schema.load(application_history_json)
            dict_data["application_id"] = application_id
            application_history = ApplicationAuditService.create_application_history(
                data=dict_data
            )

            response, status = (
                application_history_schema.dump(application_history),
                HTTPStatus.CREATED,
            )
        except KeyError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            logging.info(response)
            logging.info(err)

        except BaseException as application_err:
            response, status = {
                "type": "Invalid Request Object",
                "message": "Invalid Request Object Passed ",
                "errors": application_err.messages,
            }, HTTPStatus.BAD_REQUEST
            logging.info(response)
            logging.info(application_err)
        return response, status

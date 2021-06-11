"""API endpoints for managing application resource."""

from http import HTTPStatus
import logging

import sys, traceback


from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from ..schemas.application_audit import ApplicationAuditSchema
from ..services import ApplicationAuditService
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
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
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
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
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
            exc_traceback = sys.exc_info()
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)

        except BaseException as application_err:
            exc_traceback = sys.exc_info()
            response, status = {
                "type": "Invalid Request Object",
                "message": "Invalid Request Object Passed ",
                "errors": application_err,
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(application_err)
            # traceback.print_tb(exc_traceback)
        finally:
            return response, status

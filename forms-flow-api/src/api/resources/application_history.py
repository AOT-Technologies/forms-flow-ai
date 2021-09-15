"""API endpoints for managing application resource."""

from http import HTTPStatus
import logging
from flask import request, current_app
from flask_restx import Namespace, Resource

from api.schemas import ApplicationHistorySchema
from api.services import ApplicationHistoryService
from api.utils import auth, cors_preflight, profiletime


# keeping the base path same for application history and application/
API = Namespace("Application", description="Application")


@cors_preflight("GET,OPTIONS")
@API.route("/<string:application_id>/history", methods=["GET", "POST", "OPTIONS"])
class ApplicationHistoryResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id):
        """Get application histry."""
        return (
            (
                {
                    "applications": ApplicationHistoryService.get_application_history(
                        application_id=application_id
                    )
                }
            ),
            HTTPStatus.OK,
        )

    @staticmethod
    @auth.require
    @profiletime
    def post(application_id):
        """Post a new application using the request body."""
        application_history_json = request.get_json()

        try:
            application_history_schema = ApplicationHistorySchema()
            dict_data = application_history_schema.load(application_history_json)
            dict_data["application_id"] = application_id
            application_history = ApplicationHistoryService.create_application_history(
                data=dict_data
            )

            response, status = (
                application_history_schema.dump(application_history),
                HTTPStatus.CREATED,
            )
            return response, status
        except KeyError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            logging.exception(response)
            logging.exception(err)
            return response, status

        except BaseException as application_err:
            response, status = {
                                   "type": "Invalid Request Object",
                                   "message": "Invalid Request Object Passed ",
                                   "errors": application_err,
                               }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(application_err)
        finally:
            return response, status

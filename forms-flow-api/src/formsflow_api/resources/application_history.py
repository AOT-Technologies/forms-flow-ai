"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationHistorySchema
from formsflow_api.services import ApplicationHistoryService

# keeping the base path same for application history and application/
API = Namespace("Application", description="Application")


@cors_preflight("GET,OPTIONS")
@API.route("/<int:application_id>/history", methods=["GET", "POST", "OPTIONS"])
class ApplicationHistoryResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id):
        """Get application history.

        : application_id:- Getting application history by providing application_id
        """
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
        """Post a new history entry using the request body."""
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
            current_app.logger.error(response)
            current_app.logger.error(err)
            return response, status

        except BaseException as application_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Invalid Request Object",
                "message": "Invalid Request Object Passed ",
                "errors": application_err,
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status

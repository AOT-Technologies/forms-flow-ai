"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import ProcessService

API = Namespace("Process", description="Process")

process_list_model = API.model(
    "ProcessList",
    {
        "process": fields.List(
            fields.Nested(
                API.model(
                    "Process data",
                    {
                        "name": fields.String(),
                        "key": fields.String(),
                        "tenantKey": fields.String(),
                    },
                )
            )
        )
    },
)


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ProcessResource(Resource):
    """Resource for managing process."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=process_list_model)
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def get():
        """Get all process."""
        try:
            return (
                (
                    {
                        "process": ProcessService.get_all_processes(
                            token=request.headers["Authorization"]
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status

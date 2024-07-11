"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import ApplicationHistorySchema
from formsflow_api.services import ApplicationHistoryService

# keeping the base path same for application history and application/
API = Namespace("Application", description="Application")
application_history_model = API.model(
    "ApplicationHistory",
    {
        "applicationStatus": fields.String(),
        "created": fields.String(),
        "formId": fields.String(),
        "formUrl": fields.String(),
        "submissionId": fields.String(),
        "submittedBy": fields.String(),
    },
)

application_history_list_model = API.model(
    "ApplicationHistoryList",
    {
        "applications": fields.List(
            fields.Nested(application_history_model, description="Application History")
        )
    },
)

application_history_create_model = API.model(
    "ApplicationHistoryCreate",
    {
        "applicationStatus": fields.String(),
        "formUrl": fields.String(),
        "submittedBy": fields.String(),
    },
)


@cors_preflight("GET,OPTIONS")
@API.route("/<int:application_id>/history", methods=["GET", "POST", "OPTIONS"])
class ApplicationHistoryResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=application_history_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get(application_id):
        """Get application history."""
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
    @API.doc(body=application_history_create_model)
    @API.response(201, "CREATED:- Successful request.", model=application_history_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post(application_id):
        """Post a new history entry using the request body."""
        application_history_json = request.get_json()

        application_history_schema = ApplicationHistorySchema()
        dict_data = application_history_schema.load(application_history_json)
        dict_data["application_id"] = application_id
        application_history = ApplicationHistoryService.create_application_history(
            data=dict_data, application_id=application_id
        )

        response, status = (
            application_history_schema.dump(application_history),
            HTTPStatus.CREATED,
        )
        return response, status

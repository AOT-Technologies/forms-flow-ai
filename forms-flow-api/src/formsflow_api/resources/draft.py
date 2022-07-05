"""API endpoints for draft resource."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource

from formsflow_api.schemas import ApplicationSchema, DraftSchema
from formsflow_api.services import DraftService
from formsflow_api.utils import auth, cors_preflight, profiletime

API = Namespace("Draft", description="Application Draft endpoint")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class DraftResource(Resource):
    """Resource for managing draft applications."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Create draft form data ."""
        try:
            application_json = request.get_json()
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            application, status = DraftService.create_draft_application(
                data=dict_data, token=request.headers["Authorization"]
            )
            response = application_schema.dump(application)
            draft_json = request.get_json()
            draft_json["applicationId"] = response["id"]
            draft_schema = DraftSchema()
            dict_data = draft_schema.load(draft_json)
            draft = DraftService.create_draft(data=dict_data)
            response = draft_schema.dump(draft)
            return (response, HTTPStatus.CREATED)

        except BaseException as draft_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid submission request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(draft_err)
            return response, status


@cors_preflight("PUT,OPTIONS")
@API.route("/<int:draft_id>", methods=["PUT", "OPTIONS"])
class DraftResourceById(Resource):
    """Resource for managing draft by id."""

    @staticmethod
    @auth.require
    @profiletime
    def put(draft_id: int):
        """Update draft details."""
        draft_json = request.get_json()
        try:
            draft_schema = DraftSchema()
            dict_data = draft_schema.load(draft_json)
            DraftService.update_submission(draft_id=draft_id, data=dict_data)
            return (
                f"Updated {draft_id} successfully",
                HTTPStatus.OK,
            )
        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)

            return response, status

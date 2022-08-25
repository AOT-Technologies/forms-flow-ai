"""API endpoints for draft resource."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    NEW_APPLICATION_STATUS,
    auth,
    cors_preflight,
    profiletime,
)
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas import (
    ApplicationSchema,
    ApplicationSubmissionSchema,
    DraftListSchema,
    DraftSchema,
)
from formsflow_api.services import ApplicationService, DraftService

API = Namespace("Draft", description="Draft submission endpoint")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class DraftResource(Resource):
    """Resource for managing draft submissions."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Retrieves all drafts."""
        try:
            token = request.headers["Authorization"]
            dict_data = DraftListSchema().load(request.args) or {}
            draft, count = DraftService.get_all_drafts(dict_data)
            application_count = ApplicationService.get_application_count(auth, token)
            result = {
                "drafts": draft,
                "totalCount": count,
                "applicationCount": application_count,
            }
            return (result, HTTPStatus.OK)

        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid submission request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)
            return response, status

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Create a new draft submission."""
        try:
            application_json = request.get_json()
            application_schema = ApplicationSchema()
            application_dict_data = application_schema.load(application_json)
            draft_json = request.get_json()
            draft_schema = DraftSchema()
            draft_dict_data = draft_schema.load(draft_json)
            token = request.headers["Authorization"]
            res = DraftService.create_new_draft(
                application_dict_data, draft_dict_data, token
            )
            response = draft_schema.dump(res)
            return (response, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as draft_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid submission request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(draft_err)
            return response, status


@cors_preflight("GET,PUT,OPTIONS")
@API.route("/<int:draft_id>", methods=["GET", "PUT", "OPTIONS"])
class DraftResourceById(Resource):
    """Resource for managing draft by id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(draft_id: str):
        """Get draft by id."""
        try:
            return DraftService.get_draft(draft_id), HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def put(draft_id: int):
        """Update draft details."""
        draft_json = request.get_json()
        try:
            draft_schema = DraftSchema()
            dict_data = draft_schema.load(draft_json)
            DraftService.update_draft(draft_id=draft_id, data=dict_data)
            return (
                f"Updated {draft_id} successfully",
                HTTPStatus.OK,
            )
        except BusinessException as err:
            # exception from draft service
            current_app.logger.warning(err)
            error, status = err.error, err.status_code
            return error, status

        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)

            return response, status


@cors_preflight("PUT, OPTIONS")
@API.route("/<int:draft_id>/submit", methods=["PUT", "OPTIONS"])
class DraftSubmissionResource(Resource):
    """Converts the given draft entry to actual submission."""

    @staticmethod
    @auth.require
    @profiletime
    def put(draft_id: str):
        """Updates the application and draft entry to create a new submission."""
        try:
            payload = request.get_json()
            token = request.headers["Authorization"]
            application_schema = ApplicationSubmissionSchema()
            dict_data = application_schema.load(payload)
            dict_data["application_status"] = NEW_APPLICATION_STATUS
            response = DraftService.make_submission_from_draft(
                dict_data, draft_id, token
            )
            res = ApplicationSchema().dump(response)
            return res, HTTPStatus.OK

        except ValidationError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
            return response, status

        except BusinessException as err:
            # exception from draft service
            current_app.logger.warning(err)
            error, status = err.error, err.status_code
            return error, status

        except Exception as unexpected_error:
            raise unexpected_error


@cors_preflight("POST, OPTIONS")
@API.route("/public/create", methods=["POST", "OPTIONS"])
class PublicDraftResource(Resource):
    """Public endpoints to support anonymous forms."""

    @staticmethod
    @profiletime
    def post():
        """Create a new draft submission."""
        try:
            application_json = draft_json = request.get_json()
            application_schema = ApplicationSchema()
            draft_schema = DraftSchema()

            application_dict_data = application_schema.load(application_json)
            draft_dict_data = draft_schema.load(draft_json)
            res = DraftService.create_new_draft(application_dict_data, draft_dict_data)
            response = draft_schema.dump(res)
            return (response, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as draft_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid submission request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(draft_err)
            return response, status


@cors_preflight("PUT, OPTIONS")
@API.route("/public/<int:draft_id>/submit", methods=["PUT", "OPTIONS"])
class PublicDraftResourceById(Resource):
    """Public endpoints for anonymous draft."""

    @staticmethod
    @profiletime
    def put(draft_id: int):
        """Updates the application and draft entry to create a new submission."""
        try:
            payload = request.get_json()
            application_schema = ApplicationSubmissionSchema()
            dict_data = application_schema.load(payload)
            dict_data["application_status"] = NEW_APPLICATION_STATUS
            response = DraftService.make_submission_from_draft(dict_data, draft_id)
            res = ApplicationSchema().dump(response)
            return res, HTTPStatus.OK

        except ValidationError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
            return response, status

        except BusinessException as err:
            # exception from draft service
            current_app.logger.warning(err)
            error, status = err.error, err.status_code
            return error, status

        except Exception as unexpected_error:
            raise unexpected_error


@cors_preflight("PUT, OPTIONS")
@API.route("/public/<int:draft_id>", methods=["PUT", "OPTIONS"])
class PublicDraftUpdateResourceById(Resource):
    """Resource for updating the anonymous draft."""

    @staticmethod
    @profiletime
    def put(draft_id: int):
        """Update draft details."""
        draft_json = request.get_json()
        try:
            draft_schema = DraftSchema()
            dict_data = draft_schema.load(draft_json)
            DraftService.update_draft(draft_id=draft_id, data=dict_data)
            return (
                f"Updated {draft_id} successfully",
                HTTPStatus.OK,
            )
        except BusinessException as err:
            # exception from draft service
            current_app.logger.warning(err)
            error, status = err.error, err.status_code
            return error, status

        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)

            return response, status

"""API endpoints for filter resource."""

from http import HTTPStatus
from http.client import BAD_REQUEST

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas import FilterSchema
from formsflow_api.services import FilterService

filter_schema = FilterSchema()

API = Namespace("Filter", description="Filter APIs")


@cors_preflight("GET, POST, OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FilterResource(Resource):
    """Resource to create and list filter."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """List all filters."""
        try:
            return FilterService.get_all_filter(), HTTPStatus.OK
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Create filter."""
        try:
            filter_data = filter_schema.load(request.get_json())
            return (
                FilterService.create_filter(filter_data),
                HTTPStatus.CREATED,
            )
        except ValidationError as error:
            current_app.logger.warning(error)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, BAD_REQUEST
            return response, status
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error


@cors_preflight("GET, OPTIONS")
@API.route("/users", methods=["GET", "OPTIONS"])
class UsersFilterList(Resource):
    """Resource to list filters specific to current user."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """List filters of current user."""
        try:
            return FilterService.get_user_filter(), HTTPStatus.OK
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error


@cors_preflight("PUT, OPTIONS")
@API.route("/<int:filter_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FilterResourceById(Resource):
    """Resource for managing filter by id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(filter_id: int):
        """Get filter by id."""
        try:
            filter_result = FilterService.get_filter_by_id(filter_id)
            return filter_schema.dump(filter_result), HTTPStatus.OK
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to filter id - {filter_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

    @staticmethod
    @auth.require
    @profiletime
    def put(filter_id: int):
        """Update filter by id."""
        try:
            filter_data = filter_schema.load(request.get_json())
            filter_result = FilterService.update_filter(filter_id, filter_data)
            response = filter_schema.dump(filter_result)
            return (
                response,
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to filter id - {filter_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
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

    @staticmethod
    @auth.require
    @profiletime
    def delete(filter_id: int):
        """Delete filter by id."""
        try:
            FilterService.mark_inactive(filter_id=filter_id)
            return "Deleted", HTTPStatus.OK
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to filter id - {filter_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

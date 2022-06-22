"""API endpoints for managing NRS demo."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from formsflow_api.exceptions import BusinessException
from formsflow_api.schemas import NRSFormDataMapperSchema
from formsflow_api.schemas.nrs_demo import NRSSelectDataMapperSchema
from formsflow_api.services import (
    NRSFormDataMapperService,
    NRSSelectDataMapperService,
)
from formsflow_api.utils import auth, cors_preflight, profiletime

API = Namespace("NRS", description="NRS")


@cors_preflight("GET,POST,OPTIONS")
@API.route("/data", methods=["GET", "POST", "OPTIONS"])
class NRSdataResource(Resource):
    """Resource to get all NRS data."""

    @staticmethod
    @profiletime
    def get():
        """Get all NRS data for select option."""
        try:
            response, status = (
                (
                    {
                        "data": NRSSelectDataMapperService.get_all_mappers(),
                        "totalCount": NRSSelectDataMapperService.get_mapper_count(),
                    }
                ),
                HTTPStatus.OK,
            )
        except KeyError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )

            current_app.logger.critical(response)
            current_app.logger.critical(err)

        except BusinessException:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
        return response, status

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a inspection data using the request body."""
        mapper_json = request.get_json()
        try:
            mapper_schema = NRSSelectDataMapperSchema()
            dict_data = mapper_schema.load(mapper_json)
            mapper = NRSSelectDataMapperService.create_mapper(dict_data)
            response, status = mapper_schema.dump(mapper), HTTPStatus.CREATED
        except ValidationError as error:
            response, status = {
                "message": "Missing data for required field-label",
                "type": "Bad request error",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(error)
        except IntegrityError as error:
            response, status = {
                "message": "Label already exists",
                "type": "Bad request error",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(error)
        except Exception as error:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad Request Error",
                "message": error,
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(error)
        return response, status


@cors_preflight("PUT,DELETE,OPTIONS")
@API.route("/data/<int:data_id>", methods=["PUT", "DELETE", "OPTIONS"])
class NRSdataResourceById(Resource):
    """Resource to get NRS inspection select data by id."""

    @staticmethod
    @auth.require
    def put(data_id: int):
        """
        Update inspection data by id.

        : label:- type of inspection
        """
        application_json = request.get_json()

        try:
            mapper_schema = NRSSelectDataMapperSchema()
            dict_data = mapper_schema.load(application_json)
            NRSSelectDataMapperService.update_mapper(data_id=data_id, data=dict_data)

            return (
                f"Updated ID {data_id} successfully",
                HTTPStatus.OK,
            )

        except BusinessException:
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request passed",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            return response, status

    @staticmethod
    @auth.require
    def delete(data_id: int):
        """Delete inspection data by data_id."""
        try:
            NRSSelectDataMapperService.delete_mapper(data_id=data_id)
            return (
                f"Deleted ID {data_id}",
                HTTPStatus.OK,
            )

        except BusinessException:
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request passed",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/form", methods=["POST", "OPTIONS"])
class NRSFormResource(Resource):
    """Resource for managing NRS form."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a form process mapper using the request body."""
        mapper_json = request.get_json()
        try:
            mapper_json["co_ordinates"] = mapper_json["googleMap"]["coordinates"]
            mapper_json["location"] = mapper_json["googleMap"]["placeName"]
            mapper_schema = NRSFormDataMapperSchema()
            dict_data = mapper_schema.load(mapper_json)
            mapper = NRSFormDataMapperService.create_mapper(dict_data)
            response, status = mapper_schema.dump(mapper), HTTPStatus.CREATED
        except BusinessException:
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed for form process mapper POST API",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
        return response, status

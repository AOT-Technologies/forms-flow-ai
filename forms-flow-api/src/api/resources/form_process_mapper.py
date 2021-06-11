"""API endpoints for managing form resource."""

from http import HTTPStatus
import logging

import sys, traceback

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors

from ..exceptions import BusinessException
from ..schemas import ApplicationListReqSchema, FormProcessMapperSchema
from ..services import FormProcessMapperService
from api.utils.auth import auth
from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS


API = Namespace("Form", description="Form")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResource(Resource):
    """Resource for managing forms."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get():
        """Get form process mapper."""
        try:
            request_schema = ApplicationListReqSchema()

            if request.args:
                dict_data = request_schema.load(request.args)
                page_no = dict_data["page_no"]
                limit = dict_data["limit"]
            else:
                page_no = 0
                limit = 0
            if page_no > 0:
                return (
                    jsonify(
                        {
                            "forms": FormProcessMapperService.get_all_mappers(
                                page_no, limit
                            ),
                            "totalCount": FormProcessMapperService.get_mapper_count(),
                            "pageNo": page_no,
                            "limit": limit,
                        }
                    ),
                    HTTPStatus.OK,
                )
            else:
                return (
                    jsonify(
                        {
                            "forms": FormProcessMapperService.get_all_mappers(
                                page_no, limit
                            ),
                            "totalCount": FormProcessMapperService.get_mapper_count(),
                        }
                    ),
                    HTTPStatus.OK,
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
            return response, status

        except BaseException as form_err:
            exc_traceback = sys.exc_info()
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(form_err)
            # traceback.print_tb(exc_traceback)
            return response, status

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def post():
        """Post a form process mapper using the request body."""
        mapper_json = request.get_json()

        try:
            sub = g.token_info.get("preferred_username")
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(mapper_json)
            dict_data["created_by"] = sub

            mapper = FormProcessMapperService.create_mapper(dict_data)

            response, status = mapper_schema.dump(mapper), HTTPStatus.CREATED
            return response, status
        except BaseException as form_err:
            exc_traceback = sys.exc_info()
            response, status = {
                "message": "Invalid request object passed for FormProcessmapper POST API",
                "errors": form_err.messages,
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(form_err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:mapper_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormResourceById(Resource):
    """Resource for managing forms by mapper_id."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get(mapper_id):
        """Get form process mapper by id."""
        try:
            return (
                FormProcessMapperService.get_mapper(form_process_mapper_id=mapper_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:

            exc_traceback = sys.exc_info()

            response, status = (
                {
                    "type": "Invalid response data",
                    "message": f"Invalid form id - {mapper_id}",
                },
                HTTPStatus.BAD_REQUEST,
            )

            logging.exception(response)
            # traceback.print_tb(exc_traceback)

            return response, status

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def delete(mapper_id):
        """Delete form process mapper by id."""
        try:
            FormProcessMapperService.mark_inactive(form_process_mapper_id=mapper_id)
            return "Deleted", HTTPStatus.OK
        except BusinessException as err:

            exc_traceback = sys.exc_info()

            response, status = (
                {
                    "type": "Invalid response data",
                    "message": f"Invalid form id - {mapper_id}",
                },
                HTTPStatus.BAD_REQUEST,
            )

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)
            return response, status

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def put(mapper_id):
        """Update form process mapper details."""
        application_json = request.get_json()

        try:
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(application_json)
            sub = g.token_info.get("preferred_username")
            dict_data["modified_by"] = sub
            FormProcessMapperService.update_mapper(
                form_process_mapper_id=mapper_id, data=dict_data
            )

            return (
                f"Updated FormProcessMapper ID {mapper_id} successfully",
                HTTPStatus.OK,
            )
        except BaseException as mapper_err:

            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request passed",
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(mapper_err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class FormResourceByFormId(Resource):
    """Resource for managing forms by corresponding form_id."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    def get(form_id):
        """Get details of only form corresponding to a particular formId."""
        try:
            return (
                FormProcessMapperService.get_mapper_by_formid(form_id=form_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:

            exc_traceback = sys.exc_info()
            response, status = (
                {
                    "type": "No Response",
                    "message": f"FormProcessMapper with FormID - {form_id} not stored in DB",
                },
                HTTPStatus.NO_CONTENT,
            )
            logging.exception(response)
            # traceback.print_tb(exc_traceback)

            return response, status

"""API endpoints for managing form resource."""

from http import HTTPStatus

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas import ApplicationListReqSchema, FormProcessMapperSchema
from ..services import FormProcessMapperService
from ..utils.auth import auth
from ..utils.util import cors_preflight


API = Namespace("Form", description="Form")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResource(Resource):
    """Resource for managing forms."""

    @staticmethod
    @cors.crossdomain(origin="*")
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
        except ValidationError as form_err:
            return {"systemErrors": form_err.messages}, HTTPStatus.BAD_REQUEST

    @staticmethod
    @cors.crossdomain(origin="*")
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
        except ValidationError as form_err:
            response, status = {
                "systemErrors": form_err.messages
            }, HTTPStatus.BAD_REQUEST
        return response, status


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:mapper_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormResourceById(Resource):
    """Resource for managing forms by mapper_id."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def get(mapper_id):
        """Get form process mapper by id."""
        try:
            return FormProcessMapperService.get_mapper(mapper_id), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def delete(mapper_id):
        """Delete form process mapper."""
        try:
            FormProcessMapperService.mark_inactive(mapper_id)
            return "Deleted", HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def put(mapper_id):
        """Update form process mapper details."""
        application_json = request.get_json()

        try:
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(application_json)
            sub = g.token_info.get("preferred_username")
            dict_data["modified_by"] = sub
            FormProcessMapperService.update_mapper(mapper_id, dict_data)

            return (
                f"Updated FormProcessMapper ID {mapper_id} successfully",
                HTTPStatus.OK,
            )
        except ValidationError as mapper_err:
            return {"systemErrors": mapper_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class FormResourceByFormId(Resource):
    """Resource for managing forms by corresponding form_id."""

    @staticmethod
    @cors.crossdomain(origin="*")
    def get(form_id):
        """Get details of only form corresponding to a particular formId."""
        try:
            return FormProcessMapperService.get_mapper_by_formid(form_id), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

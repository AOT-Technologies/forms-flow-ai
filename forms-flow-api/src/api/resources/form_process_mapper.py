"""API endpoints for managing form resource."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource

from ..exceptions import BusinessException
from ..schemas import ApplicationListReqSchema, FormProcessMapperSchema
from ..services import FormProcessMapperService
from api.utils import auth, cors_preflight, profiletime


API = Namespace("Form", description="Form")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResource(Resource):
    """Resource for managing forms."""

    @staticmethod
    @auth.require
    @profiletime
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
                response, status = (
                    (
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
                return response, status
            else:
                response, status = (
                    (
                        {
                            "forms": FormProcessMapperService.get_all_mappers(
                                page_no, limit
                            ),
                            "totalCount": FormProcessMapperService.get_mapper_count(),
                        }
                    ),
                    HTTPStatus.OK,
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

            current_app.logger.critical(response)
            current_app.logger.critical(err)
            return response, status

        except BaseException as form_err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(form_err)
            return response, status

    @staticmethod
    @auth.require
    @profiletime
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
            response, status = {
                "message": "Invalid request object passed for FormProcessmapper POST API",
                "errors": form_err.messages,
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(form_err)
            return response, status


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:mapper_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormResourceById(Resource):
    """Resource for managing forms by mapper_id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(mapper_id):
        """Get form process mapper by id."""
        try:
            return (
                FormProcessMapperService.get_mapper(form_process_mapper_id=mapper_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            response, status = (
                {
                    "type": "Invalid response data",
                    "message": f"Invalid form id - {mapper_id}",
                },
                HTTPStatus.BAD_REQUEST,
            )

            current_app.logger.warning(response)
            return response, status

    @staticmethod
    @auth.require
    @profiletime
    def delete(mapper_id):
        """Delete form process mapper by id."""
        try:
            FormProcessMapperService.mark_inactive(form_process_mapper_id=mapper_id)
            return "Deleted", HTTPStatus.OK
        except BusinessException as err:
            response, status = (
                {
                    "type": "Invalid response data",
                    "message": f"Invalid form id - {mapper_id}",
                },
                HTTPStatus.BAD_REQUEST,
            )

            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status

    @staticmethod
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
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request passed",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(mapper_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class FormResourceByFormId(Resource):
    """Resource for managing forms by corresponding form_id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id):
        """Get details of only form corresponding to a particular formId."""
        try:
            return (
                FormProcessMapperService.get_mapper_by_formid(form_id=form_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            response, status = (
                {
                    "type": "No Response",
                    "message": f"No Response found as FormProcessMapper with FormID - {form_id} not stored in DB",
                },
                HTTPStatus.NO_CONTENT,
            )
            current_app.logger.info(response)
            return response, status

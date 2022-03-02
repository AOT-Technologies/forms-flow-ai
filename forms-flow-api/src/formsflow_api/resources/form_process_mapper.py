"""API endpoints for managing form resource."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource

from formsflow_api.exceptions import BusinessException
from formsflow_api.schemas import (
    FormProcessMapperSortingSchema,
    FormProcessMapperPaginationSchema,
    FormProcessMapperSearchSchema,
    FormProcessMapperSchema,
)
from formsflow_api.services import ApplicationService, FormProcessMapperService
from formsflow_api.utils import auth, cors_preflight, profiletime

API = Namespace("Form", description="Form")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResource(Resource):
    """Resource for managing forms."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Get form process mapper.
        : pageNo:- To retrieve page number
        : limit:- To retrieve limit for each page
        : formName:- Retrieve form list based on form name
        : sortBy:- Name of column to sort by (default: id)
        : sortOrder:- Order for sorting (asc/desc) (default: desc)
        """
        try:
            request_data = request.get_json()
            current_app.logger.warning(request_data)
            dict_data = FormProcessMapperSearchSchema().load(request_data) or {}
            form_name: str = dict_data.get("form_name")
            pagination: FormProcessMapperPaginationSchema = dict_data.get("pagination")
            page_no: int = pagination.get("page_no")
            limit: int = pagination.get("limit")
            sorting: FormProcessMapperSortingSchema = pagination.get("sorting")
            sort_by: str = sorting.get("sort_by") or "id"
            sort_order: str = sorting.get("sort_order") or "desc"

            if page_no and limit:
                (
                    form_process_mapper_schema,
                    form_process_mapper_count,
                ) = FormProcessMapperService.get_all_mappers(
                    page_no, limit, form_name, sort_by, sort_order
                )
            else:
                (
                    form_process_mapper_schema,
                    form_process_mapper_count,
                ) = FormProcessMapperService.get_all_mappers(
                    page_no, limit, form_name, sort_by, sort_order
                )
            return (
                (
                    {
                        "forms": form_process_mapper_schema,
                        "totalCount": form_process_mapper_count,
                        "pageNo": page_no,
                        "limit": limit,
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
            return response, status

        except BaseException as form_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(form_err)
            return response, status

@cors_preflight("GET,POST,OPTIONS")
@API.route("/create", methods=["GET", "POST", "OPTIONS"])
class FormResourceByIds(Resource):
    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a form process mapper using the request body."""
        mapper_json = request.get_json()
        try:
            sub: str = g.token_info.get("preferred_username")
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(mapper_json)
            dict_data["created_by"] = sub
            mapper = FormProcessMapperService.create_mapper(dict_data)

            response, status = mapper_schema.dump(mapper), HTTPStatus.CREATED
            return response, status
        except BaseException as form_err:  # pylint: disable=broad-except
            response, status = {
                "message": "Invalid request object passed for FormProcessmapper POST API",
                "errors": form_err,
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
    def get(mapper_id: int):
        """Get forms.
        : mapper_id:- Get form process mapper by mapper_id
        """
        try:
            return (
                FormProcessMapperService.get_mapper(form_process_mapper_id=mapper_id),
                HTTPStatus.OK,
            )
        except BusinessException:
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
    def delete(mapper_id: int):
        """
        : mapper_id:- Delete form process mapper by mapper_id.
        """
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
    def put(mapper_id: int):
        """
        : comments:- Brief description
        : formId:- Unique Id for the corresponding form
        : formName:- Name for the corresponding form
        : id:- Id for particular form
        : processKey:- Workflow associated for particular form
        : processName:- Workflow associated for particular form
        : status:- Status of the form
        """
        application_json = request.get_json()

        try:
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(application_json)
            sub: str = g.token_info.get("preferred_username")
            dict_data["modified_by"] = sub
            FormProcessMapperService.update_mapper(
                form_process_mapper_id=mapper_id, data=dict_data
            )

            return (
                f"Updated FormProcessMapper ID {mapper_id} successfully",
                HTTPStatus.OK,
            )
        except BaseException as mapper_err:  # pylint: disable=broad-except
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
    def get(form_id: str):
        """
        : form_id:- Get details of only form corresponding to a particular formId
        """
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
            current_app.logger.warning(err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/<int:mapper_id>/application/count", methods=["GET", "OPTIONS"])
class FormResourceApplicationCount(Resource):
    """Resource for getting applications count according to a mapper id"""

    @staticmethod
    @auth.require
    @profiletime
    def get(mapper_id: int):
        """The method retrieves the total application count for th egiven mapper id"""
        (
            response,
            status,
        ) = ApplicationService.get_total_application_corresponding_to_mapper_id(
            mapper_id
        )
        return {"message": response}, status

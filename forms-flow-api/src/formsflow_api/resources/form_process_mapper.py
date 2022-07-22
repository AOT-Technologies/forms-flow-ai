"""API endpoints for managing form resource."""

import json
import string
from http import HTTPStatus

from flask import current_app, make_response, render_template, request
from flask_restx import Namespace, Resource

from formsflow_api.exceptions import BusinessException
from formsflow_api.schemas import (
    FormProcessMapperListRequestSchema,
    FormProcessMapperSchema,
)
from formsflow_api.services import (
    ApplicationService,
    FormioService,
    FormProcessMapperService,
)
from formsflow_api.utils import (
    CLIENT_GROUP,
    DESIGNER_GROUP,
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)
from formsflow_api.utils.pdf import get_pdf_from_html, pdf_response

API = Namespace("Form", description="Form")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResourceList(Resource):
    """Resource for getting forms."""

    @staticmethod
    @auth.require
    @profiletime
    def get():  # pylint: disable=too-many-locals
        """Get form process mapper.

        : pageNo:- To retrieve page number
        : limit:- To retrieve limit for each page
        : formName:- Retrieve form list based on form name
        : sortBy:- Name of column to sort by (default: id)
        : sortOrder:- Order for sorting (asc/desc) (default: desc)
        """
        try:
            auth_form_details = ApplicationService.get_authorised_form_list(
                token=request.headers["Authorization"]
            )
            current_app.logger.info(auth_form_details)
            dict_data = FormProcessMapperListRequestSchema().load(request.args) or {}
            form_name: str = dict_data.get("form_name")
            page_no: int = dict_data.get("page_no")
            limit: int = dict_data.get("limit")
            sort_by: str = dict_data.get("sort_by", "id")
            sort_order: str = dict_data.get("sort_order", "desc")
            auth_list = auth_form_details.get("authorizationList") or {}
            resource_list = [group["resourceId"] for group in auth_list]
            if (
                auth_form_details.get("adminGroupEnabled") is True
                or "*" in resource_list
            ):
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
                    page_no, limit, form_name, sort_by, sort_order, resource_list
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

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a form process mapper using the request body."""
        mapper_json = request.get_json()
        try:
            mapper_json["taskVariable"] = json.dumps(
                mapper_json.get("taskVariable") or []
            )
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(mapper_json)
            mapper = FormProcessMapperService.create_mapper(dict_data)
            FormProcessMapperService.unpublish_previous_mapper(dict_data)
            response = mapper_schema.dump(mapper)
            response["taskVariable"] = json.loads(response["taskVariable"])
            return response, HTTPStatus.CREATED
        except BaseException as form_err:  # pylint: disable=broad-except
            response, status = {
                "message": "Invalid request object passed",
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
        """Get form by mapper_id.

        : mapper_id:- Get form process mapper by mapper_id
        """
        try:
            return (
                FormProcessMapperService.get_mapper(form_process_mapper_id=mapper_id),
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {mapper_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def delete(mapper_id: int):
        """Delete form by mapper_id.

        : mapper_id:- Delete form process mapper by mapper_id.
        """
        try:
            FormProcessMapperService.mark_inactive_and_delete(
                form_process_mapper_id=mapper_id
            )
            return "Deleted", HTTPStatus.OK
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {mapper_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

    @staticmethod
    @auth.require
    def put(mapper_id: int):
        """Update form by mapper_id.

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
            if "taskVariable" in application_json:
                application_json["taskVariable"] = json.dumps(
                    application_json.get("taskVariable")
                )
            mapper_schema = FormProcessMapperSchema()
            dict_data = mapper_schema.load(application_json)
            mapper = FormProcessMapperService.update_mapper(
                form_process_mapper_id=mapper_id, data=dict_data
            )
            response = mapper_schema.dump(mapper)
            response["taskVariable"] = json.loads(response["taskVariable"])
            return (
                response,
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {mapper_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
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
        """Get form by form_id.

        : form_id:- Get details of only form corresponding to a particular formId
        """
        try:
            response = FormProcessMapperService.get_mapper_by_formid(form_id=form_id)
            response["taskVariable"] = json.loads(response["taskVariable"])
            return (
                response,
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {form_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            response, status = (
                {
                    "type": "No Response",
                    "message": (
                        "No Response found as FormProcessMapper with"
                        f"FormID - {form_id} not stored in DB"
                    ),
                },
                HTTPStatus.NO_CONTENT,
            )
            current_app.logger.info(response)
            current_app.logger.warning(err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/<int:mapper_id>/application/count", methods=["GET", "OPTIONS"])
class FormResourceApplicationCount(Resource):
    """Resource for getting applications count according to a mapper id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(mapper_id: int):
        """The method retrieves the total application count for the given mapper id."""
        try:
            FormProcessMapperService.check_tenant_authorization(mapper_id=mapper_id)
            (
                response,
                status,
            ) = ApplicationService.get_total_application_corresponding_to_mapper_id(
                mapper_id
            )
            return response, status
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {mapper_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/applicationid/<int:application_id>", methods=["GET", "OPTIONS"])
class FormResourceTaskVariablesbyApplicationId(Resource):
    """Resource to get task filter variables of a form based on application id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id: int):
        """The method retrieves task variables based on application id."""
        try:
            return (
                ApplicationService.get_application_form_mapper_by_id(application_id),
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to resource - {application_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@cors_preflight("POST,OPTIONS")
@API.route("/form-create", methods=["POST", "OPTIONS"])
class FormioFormResource(Resource):
    """Resource for formio form creation."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Formio form creation method."""
        try:
            data = request.get_json()
            if auth.has_role([DESIGNER_GROUP]):
                formio_service = FormioService()
                form_io_token = formio_service.get_formio_access_token()
                response, status = (
                    formio_service.create_form(data, form_io_token),
                    HTTPStatus.CREATED,
                )
            else:
                response, status = (
                    {
                        "message": "Permission Denied",
                    },
                    HTTPStatus.FORBIDDEN,
                )
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@API.route("/<string:form_id>/submission/<string:submission_id>/render")
class FormResourceRenderFormPdf(Resource):
    """Resource to render form and submission details as html."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """Form rendering method."""
        formio_service = FormioService()
        form_io_url = current_app.config.get("FORMIO_URL")
        form_io_token = formio_service.get_formio_access_token()
        form_url = form_io_url + "/form/" + form_id + "/submission/" + submission_id
        form_info = {
            "base_url": form_io_url,
            "project_url": form_io_url,
            "form_url": form_url,
            "token": form_io_token,
        }
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template("index.html", form=form_info), 200, headers
        )


@cors_preflight("GET,OPTIONS")
@API.route(
    "/<string:form_id>/submission/<string:submission_id>/export/pdf",
    methods=["GET", "OPTIONS"],
)
class FormResourceExportFormPdf(Resource):
    """Resource to export form and submission details as pdf."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """PDF generation and rendering method."""
        try:
            if auth.has_one_of_roles([REVIEWER_GROUP, CLIENT_GROUP]):
                token = request.headers.get("Authorization")
                host_name = current_app.config.get("FORMSFLOW_API_URL")
                url = (
                    host_name
                    + "/form/"
                    + form_id
                    + "/submission/"
                    + submission_id
                    + "/render"
                )
                file_name = (
                    "Application_" + form_id + "_" + submission_id + "_export.pdf"
                )
                result = get_pdf_from_html(url, wait="completed", auth_token=token)
                return pdf_response(result, file_name)

            response, status = (
                {
                    "message": "Permission Denied",
                },
                HTTPStatus.FORBIDDEN,
            )
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

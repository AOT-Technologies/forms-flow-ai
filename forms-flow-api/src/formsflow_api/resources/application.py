"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    get_form_and_submission_id_from_form_url,
    profiletime,
)
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas import (
    ApplicationListReqSchema,
    ApplicationListRequestSchema,
    ApplicationSchema,
    ApplicationUpdateSchema,
)
from formsflow_api.services import ApplicationService

API = Namespace("Application", description="Application")

application_create_model = API.model(
    "ApplicationCreate",
    {
        "formId": fields.String(),
        "submissionId": fields.String(),
        "formUrl": fields.String(),
        "webFormUrl": fields.String(),
    },
)

application_base_model = API.model(
    "ApplicationCreateResponse",
    {
        "applicationStatus": fields.String(),
        "created": fields.String(),
        "createdBy": fields.String(),
        "formId": fields.String(),
        "formProcessMapperId": fields.String(),
        "id": fields.Integer(),
        "modified": fields.String(),
        "modifiedBy": fields.String(),
        "processInstanceId": fields.String(),
        "submissionId": fields.String(),
    },
)

application_model = API.inherit(
    "Application",
    application_base_model,
    {
        "applicationName": fields.String(),
        "processKey": fields.String(),
        "processName": fields.String(),
        "processTenant": fields.String(),
    },
)

application_list_model = API.model(
    "ApplicationList",
    {
        "applications": fields.List(
            fields.Nested(application_model, description="List of Applications.")
        ),
        "draftCount": fields.Integer(),
        "totalCount": fields.Integer(),
        "limit": fields.Integer(),
        "pageNo": fields.Integer(),
    },
)

application_update_model = API.model(
    "ApplicationUpdate",
    {"applicationStatus": fields.String(), "formUrl": fields.String()},
)

application_status_list_model = API.model(
    "StatusList", {"applicationStatus": fields.List(fields.String())}
)


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
                "default": "1",
            },
            "limit": {
                "in": "query",
                "description": "Limit for paginated results",
                "default": "5",
            },
            "sortBy": {
                "in": "query",
                "description": "Specify field for sorting the results.",
                "default": "id",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
            },
            "applicationName": {
                "in": "query",
                "description": "Filter resources by application name.",
                "type": "string",
            },
            "id": {
                "in": "query",
                "description": "Filter resources by id.",
                "type": "int",
            },
            "modifiedFrom": {
                "in": "query",
                "description": "Filter resources by modified from.",
                "type": "string",
            },
            "modifiedTo": {
                "in": "query",
                "description": "Filter resources by modified to.",
                "type": "string",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=application_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get():  # pylint:disable=too-many-locals
        """Get applications."""
        try:
            dict_data = ApplicationListRequestSchema().load(request.args) or {}
            page_no = dict_data.get("page_no")
            limit = dict_data.get("limit")
            order_by = dict_data.get("order_by", "id")
            application_id = dict_data.get("application_id")
            application_name = dict_data.get("application_name")
            application_status = dict_data.get("application_status")
            created_by = dict_data.get("created_by")
            created_from_date = dict_data.get("created_from_date")
            created_to_date = dict_data.get("created_to_date")
            modified_from_date = dict_data.get("modified_from_date")
            modified_to_date = dict_data.get("modified_to_date")
            sort_order = dict_data.get("sort_order", "desc")
            if auth.has_role([REVIEWER_GROUP]):
                (
                    application_schema_dump,
                    application_count,
                    draft_count,
                ) = ApplicationService.get_auth_applications_and_count(
                    created_from=created_from_date,
                    created_to=created_to_date,
                    modified_from=modified_from_date,
                    modified_to=modified_to_date,
                    order_by=order_by,
                    sort_order=sort_order,
                    created_by=created_by,
                    application_id=application_id,
                    application_name=application_name,
                    application_status=application_status,
                    token=request.headers["Authorization"],
                    page_no=page_no,
                    limit=limit,
                )
            else:
                (
                    application_schema_dump,
                    application_count,
                    draft_count,
                ) = ApplicationService.get_all_applications_by_user(
                    page_no=page_no,
                    limit=limit,
                    order_by=order_by,
                    sort_order=sort_order,
                    created_from=created_from_date,
                    created_to=created_to_date,
                    modified_from=modified_from_date,
                    modified_to=modified_to_date,
                    created_by=created_by,
                    application_id=application_id,
                    application_name=application_name,
                    application_status=application_status,
                )
            return (
                (
                    {
                        "applications": application_schema_dump,
                        "totalCount": application_count,
                        "draftCount": draft_count,
                        "limit": limit,
                        "pageNo": page_no,
                    }
                ),
                HTTPStatus.OK,
            )
        except ValidationError as err:
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


@cors_preflight("GET,PUT,OPTIONS")
@API.route("/<int:application_id>", methods=["GET", "PUT", "OPTIONS"])
class ApplicationResourceById(Resource):
    """Resource for getting application by id."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=application_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get(application_id: int):
        """Get application by id."""
        try:
            if auth.has_role([REVIEWER_GROUP]):
                (
                    application_schema_dump,
                    status,
                ) = ApplicationService.get_auth_by_application_id(
                    application_id=application_id,
                    token=request.headers["Authorization"],
                )
                return (
                    application_schema_dump,
                    status,
                )
            application, status = ApplicationService.get_application_by_user(
                application_id=application_id
            )
            return (application, status)
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {application_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=application_update_model)
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def put(application_id: int):
        """Update application details."""
        application_json = request.get_json()
        try:
            application_schema = ApplicationUpdateSchema()
            dict_data = application_schema.load(application_json)
            form_url = dict_data.get("form_url", None)
            if form_url:
                (
                    latest_form_id,
                    submission_id,
                ) = get_form_and_submission_id_from_form_url(form_url)
                dict_data["latest_form_id"] = latest_form_id
                dict_data["submission_id"] = submission_id
            ApplicationService.update_application(
                application_id=application_id, data=dict_data
            )
            return "Updated successfully", HTTPStatus.OK
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to application-{application_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status

        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)

            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class ApplicationResourceByFormId(Resource):
    """Resource for getting applications based on formid."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
                "default": "1",
            },
            "limit": {
                "in": "query",
                "description": "Limit for paginated results",
                "default": "5",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=application_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get(form_id: str):
        """Get applications by formId."""
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0

        if auth.has_role(["formsflow-reviewer"]):
            application_schema = ApplicationService.get_all_applications_form_id(
                form_id=form_id, page_no=page_no, limit=limit
            )
            application_count = ApplicationService.get_all_applications_form_id_count(
                form_id=form_id
            )
        else:
            application_schema = ApplicationService.get_all_applications_form_id_user(
                form_id=form_id,
                page_no=page_no,
                limit=limit,
            )
            application_count = (
                ApplicationService.get_all_applications_form_id_user_count(
                    form_id=form_id
                )
            )

        if page_no == 0:
            return (
                (
                    {
                        "applications": application_schema,
                        "totalCount": application_count,
                    }
                ),
                HTTPStatus.OK,
            )
        return (
            (
                {
                    "applications": application_schema,
                    "totalCount": application_count,
                    "limit": limit,
                    "pageNo": page_no,
                }
            ),
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>/count", methods=["GET", "OPTIONS"])
class ApplicationResourceCountByFormId(Resource):
    """Resource for getting applications count on formid."""

    @staticmethod
    @auth.has_one_of_roles([DESIGNER_GROUP])
    @profiletime
    def get(form_id: str):
        """Get application count by formId."""
        try:
            application_count = ApplicationService.get_all_applications_form_id_count(
                form_id=form_id
            )
            return (
                (
                    {
                        "message": f"Total Applications found are: {application_count}",
                        "value": application_count,
                    }
                ),
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to application count of-{form_id} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except KeyError as err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BaseException as application_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/create", methods=["POST", "OPTIONS"])
class ApplicationResourcesByIds(Resource):
    """Resource for application creation."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=application_create_model)
    @API.response(201, "CREATED:- Successful request.", model=application_base_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Post a new application using the request body.

        e.g,
        ```
        {
           "formId":"632208d9fbcab29c2ab1a097",
           "submissionId":"63407583fbcab29c2ab1bed4",
           "formUrl":"https://formsflow-forms/form/632208d9fbcab29c2ab1a097/submission/63407583fbcab29c2ab1bed4",
           "webFormUrl":"https://formsflow-web/form/632208d9fbcab29c2ab1a097/submission/63407583fbcab29c2ab1bed4"
        }
        ```
        """
        application_json = request.get_json()

        try:
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            application, status = ApplicationService.create_application(
                data=dict_data, token=request.headers["Authorization"]
            )
            response = application_schema.dump(application)
            return response, status
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to formId-{dict_data['form_id']} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except KeyError as err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BaseException as application_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/status/list", methods=["GET", "OPTIONS"])
class ApplicationResourceByApplicationStatus(Resource):
    """Get application status list."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=application_status_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get():
        """Method to get the application status lists."""
        try:
            return (
                ApplicationService.get_all_application_status(),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

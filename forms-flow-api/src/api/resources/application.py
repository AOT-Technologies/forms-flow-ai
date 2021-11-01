"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource

from api.exceptions import BusinessException
from api.schemas.application import (
    ApplicationListReqSchema,
    ApplicationSchema,
    ApplicationUpdateSchema,
)
from api.services import ApplicationService
from api.utils import REVIEWER_GROUP, auth, cors_preflight, profiletime


API = Namespace("Application", description="Application")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Get applications."""
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0
        if auth.has_role([REVIEWER_GROUP]):
            (
                application_schema_dump,
                application_count,
            ) = ApplicationService.get_auth_applications_and_count(
                page_no=page_no, limit=limit, token=request.headers["Authorization"]
            )
            application_schema = ApplicationService.apply_custom_attributes(
                application_schema=application_schema_dump
            )
        else:
            application_schema = ApplicationService.apply_custom_attributes(
                ApplicationService.get_all_applications_by_user(
                    user_id=g.token_info.get("preferred_username"),
                    page_no=page_no,
                    limit=limit,
                )
            )
            application_count = ApplicationService.get_all_application_by_user_count(
                user_id=g.token_info.get("preferred_username")
            )
        if page_no > 0:
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
        else:
            return (
                (
                    {
                        "applications": application_schema,
                        "totalCount": application_count,
                    }
                ),
                HTTPStatus.OK,
            )

    # @staticmethod
    # @auth.require
    # def post():
    #     """Post a new application using the request body."""
    #     application_json = request.get_json()
    #     """Get applications."""
    #     try:
    #         return (
    #             jsonify(
    #                 {
    #                     "applications": ApplicationService.apply_custom_attributes(
    #                         ApplicationService.get_all_applications_ids(
    #                             application_json["applicationIds"]
    #                         )
    #                     )
    #                 }
    #             ),
    #             HTTPStatus.OK,
    #         )
    #     except BusinessException as err:
    #         return err.error, err.status_code


@cors_preflight("GET,PUT,OPTIONS")
@API.route("/<int:application_id>", methods=["GET", "PUT", "OPTIONS"])
class ApplicationResourceById(Resource):
    """Resource for submissions."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id):
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
                    ApplicationService.apply_custom_attributes(application_schema_dump),
                    status,
                )
            else:
                application, status = ApplicationService.get_application_by_user(
                    application_id=application_id,
                    user_id=g.token_info.get("preferred_username"),
                )
                return (ApplicationService.apply_custom_attributes(application), status)
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def put(application_id):
        """Update application details."""
        application_json = request.get_json()
        try:
            application_schema = ApplicationUpdateSchema()
            dict_data = application_schema.load(application_json)
            sub = g.token_info.get("preferred_username")
            dict_data["modified_by"] = sub
            ApplicationService.update_application(
                application_id=application_id, data=dict_data
            )
            return "Updated successfully", HTTPStatus.OK
        except BaseException as submission_err:
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
    """Resource for submissions."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id):
        """Get applications."""
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0

        if auth.has_role(["formsflow-reviewer"]):
            application_schema = ApplicationService.apply_custom_attributes(
                ApplicationService.get_all_applications_form_id(
                    form_id=form_id, page_no=page_no, limit=limit
                )
            )
            application_count = ApplicationService.get_all_applications_form_id_count(
                form_id=form_id
            )
        else:
            application_schema = ApplicationService.apply_custom_attributes(
                ApplicationService.get_all_applications_form_id_user(
                    form_id=form_id,
                    user_id=g.token_info.get("preferred_username"),
                    page_no=page_no,
                    limit=limit,
                )
            )
            application_count = (
                ApplicationService.get_all_applications_form_id_user_count(
                    form_id=form_id, user_id=g.token_info.get("preferred_username")
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
        else:
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


@cors_preflight("POST,OPTIONS")
@API.route("/create", methods=["POST", "OPTIONS"])
class ApplicationResourcesByIds(Resource):
    """Resource for submissions."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a new application using the request body."""
        application_json = request.get_json()

        try:
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            sub = g.token_info.get("preferred_username")
            dict_data["created_by"] = sub
            application = ApplicationService.create_application(
                data=dict_data, token=request.headers["Authorization"]
            )

            response, status = application_schema.dump(application), HTTPStatus.CREATED
            return response, status
        except BaseException as application_err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/<string:application_id>/process", methods=["GET", "OPTIONS"])
class ProcessMapperResourceByApplicationId(Resource):
    """Resource for managing process details."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id):

        try:
            return (
                ApplicationService.get_application_form_mapper_by_id(application_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

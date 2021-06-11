"""API endpoints for managing application resource."""

from http import HTTPStatus
import logging

import sys, traceback


from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors

from ..exceptions import BusinessException
from ..schemas.aggregated_application import AggregatedApplicationReqSchema
from ..schemas.application import (
    ApplicationListReqSchema,
    ApplicationSchema,
    ApplicationUpdateSchema,
)
from ..services import ApplicationService, ApplicationAuditService
from api.utils.auth import auth
from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS


API = Namespace("Application", description="Application")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get():
        """Get applications."""
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0
        if auth.has_role(["formsflow-reviewer"]):
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
                jsonify(
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
                jsonify(
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
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get(application_id):
        """Get application by id."""
        try:
            return (
                ApplicationService.apply_custom_attributes(
                    ApplicationService.get_application(application_id=application_id)
                ),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
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
            exc_traceback = sys.exc_info()
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(submission_err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class ApplicationResourceByFormId(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
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
                jsonify(
                    {
                        "applications": application_schema,
                        "totalCount": application_count,
                    }
                ),
                HTTPStatus.OK,
            )
        else:
            return (
                jsonify(
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
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
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
            exc_traceback = sys.exc_info()
            response = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }
            logging.exception(response)
            logging.exception(application_err)
            # traceback.print_tb(exc_traceback)
            return response


@cors_preflight("GET,OPTIONS")
@API.route("/metrics", methods=["GET", "OPTIONS"])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get():
        """Get aggregated applications."""
        try:
            request_schema = AggregatedApplicationReqSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data["from_date"]
            to_date = dict_data["to_date"]

            return (
                jsonify(
                    {
                        "applications": ApplicationService.get_aggregated_applications(
                            from_date=from_date, to_date=to_date
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as agg_err:

            exc_traceback = sys.exc_info()

            response, status = {
                "message": "Invalid request object for application metrics endpoint",
                "errors": agg_err,
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(agg_err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/metrics/<int:mapper_id>", methods=["GET", "OPTIONS"])
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get(mapper_id):
        """Get aggregated application status."""
        try:
            request_schema = AggregatedApplicationReqSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data["from_date"]
            to_date = dict_data["to_date"]

            return (
                jsonify(
                    {
                        "applicationStatus": ApplicationService.get_aggregated_application_status(
                            mapper_id=mapper_id, from_date=from_date, to_date=to_date
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as agg_err:

            exc_traceback = sys.exc_info()

            response, status = {
                "message": "Invalid request object for application metrics endpoint",
                "errors": agg_err,
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(agg_err)
            # traceback.print_tb(exc_traceback)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/<string:application_id>/process", methods=["GET", "OPTIONS"])
class ProcessMapperResourceByApplicationId(Resource):
    """Resource for managing process details."""

    @staticmethod
    def get(application_id):

        try:
            return (
                ApplicationService.get_application_form_mapper_by_id(application_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

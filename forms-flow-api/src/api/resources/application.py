"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas.aggregated_application import AggregatedApplicationReqSchema
from ..schemas.application import (
    ApplicationListReqSchema,
    ApplicationSchema,
    ApplicationUpdateSchema,
)
from ..services import ApplicationService, ApplicationAuditService
from ..utils.auth import auth
from ..utils.util import cors_preflight

import json


API = Namespace("Application", description="Application")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @cors.crossdomain(origin="*")
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
                page_no, limit, request.headers["Authorization"]
            )
            application_schema = ApplicationService.apply_custom_attributes(
                application_schema_dump
            )
        else:
            application_schema = ApplicationService.apply_custom_attributes(
                ApplicationService.get_all_applications_by_user(
                    g.token_info.get("preferred_username"), page_no, limit
                )
            )
            application_count = ApplicationService.get_all_application_by_user_count(
                g.token_info.get("preferred_username")
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

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def post():
        """Post a new application using the request body."""
        application_json = request.get_json()
        """Get applications."""
        try:
            return (
                jsonify(
                    {
                        "applications": ApplicationService.apply_custom_attributes(
                            ApplicationService.get_all_applications_ids(
                                application_json["applicationIds"]
                            )
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code


@cors_preflight("GET,PUT,OPTIONS")
@API.route("/<int:application_id>", methods=["GET", "PUT", "OPTIONS"])
class ApplicationResourceById(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def get(application_id):
        """Get application by id."""
        try:
            return (
                ApplicationService.apply_custom_attributes(
                    ApplicationService.get_application(application_id)
                ),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def put(application_id):
        """Update application details."""
        application_json = request.get_json()
        try:
            application_schema = ApplicationUpdateSchema()
            dict_data = application_schema.load(application_json)
            sub = g.token_info.get("preferred_username")
            dict_data["modified_by"] = sub
            ApplicationService.update_application(application_id, dict_data)
            return "Updated successfully", HTTPStatus.OK
        except BaseException as submission_err:
            return {"systemErrors": submission_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class ApplicationResourceByFormId(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin="*")
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
                ApplicationService.get_all_applications_form_id(form_id, page_no, limit)
            )
            application_count = ApplicationService.get_all_applications_form_id_count(
                form_id
            )
        else:
            application_schema = ApplicationService.apply_custom_attributes(
                ApplicationService.get_all_applications_form_id_user(
                    form_id, g.token_info.get("preferred_username"), page_no, limit
                )
            )
            application_count = (
                ApplicationService.get_all_applications_form_id_user_count(
                    form_id, g.token_info.get("preferred_username")
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
    @cors.crossdomain(origin="*")
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
                dict_data, request.headers["Authorization"]
            )

            response, status = application_schema.dump(application), HTTPStatus.CREATED
        except BaseException as application_err:
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid application request passed"
            }, HTTPStatus.BAD_REQUEST
        return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/metrics", methods=["GET", "OPTIONS"])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin="*")
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
                            from_date, to_date
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as agg_err:
            return {"systemErrors": agg_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight("GET,OPTIONS")
@API.route("/metrics/<int:mapper_id>", methods=["GET", "OPTIONS"])
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin="*")
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
                            mapper_id, from_date, to_date
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as agg_err:
            return {"systemErrors": agg_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight("GET,OPTIONS")
@API.route("/<string:application_id>/process", methods=["GET", "OPTIONS"])
class ProcessMapperResourceByApplicationId(Resource):
    """Resource for managing process details."""

    @staticmethod
    @cors.crossdomain(origin="*")
    def get(application_id):

        try:
            return (
                ApplicationService.get_application_form_mapper_by_id(application_id),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

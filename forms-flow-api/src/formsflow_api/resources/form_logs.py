"""API endpoints for managing form resource."""


from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas.form_logs import (
    FormLogsRequestSchema,
    FormVariableSchema,
)
from formsflow_api.services.form_logs import FormlogService

API = Namespace("FormLogs", description="Form logs")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class FormLogResource(Resource):
    """API to manage the form logs."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """To create the form logs."""
        try:
            form_logs_schema = FormLogsRequestSchema()
            form_logs_data = form_logs_schema.load(request.json)
            formdata = FormlogService.create_form_logs(form_logs_data)
            return (formdata, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as logs_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid form logs request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(logs_err)
            return response, status


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<string:form_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormLogUpdateResource(Resource):
    """To update the form logs."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: str):
        """Return all form logs aginst the form id."""
        try:
            return FormlogService.get_form_logs_by_id(form_id)
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def put(form_id: str):
        """Update form logs against formid and return whole data."""
        try:
            form_logs_schema = FormVariableSchema()
            form_logs_data = form_logs_schema.load(request.json)
            return FormlogService.update_form_logs(form_id, form_logs_data)
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def delete(form_id: str):
        """Delete all form logs against this form id."""
        try:
            return FormlogService.delete_form_logs(form_id)
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

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
    """API TO MANAGE THE FORM LOGS."""
    @staticmethod
    @auth.require
    @profiletime
    def post():
        """TO CREATE THE FORM LOGS"""
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
    """FORM LOGS UPDATE RESOURCE"""
    @auth.require
    @profiletime
    @staticmethod
    def get(form_id: str):
        """return all form logs aginst the form id"""
        try:
            if form_id:
                return FormlogService.get_form_logs_by_id(form_id), HTTPStatus.OK
            return HTTPStatus.BAD_REQUEST
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

    @auth.require
    @profiletime
    @staticmethod
    def put(form_id: str):
        """update form logs against formid and return whole data"""
        try:
            form_logs_schema = FormVariableSchema()
            form_logs_data = form_logs_schema.load(request.json)
            formdata = FormlogService.update_form_logs(form_id, form_logs_data)
            return formdata, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

    @auth.require
    @profiletime
    @staticmethod
    def delete(form_id: str):
        """delete all form logs against this form id"""
        try:
            FormlogService.delete_form_logs(form_id)
            return {"message": "successfully deleted"}, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err)
            return err.error, err.status_code

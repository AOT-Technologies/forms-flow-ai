"""API endpoints for managing form resource."""


from http import HTTPStatus


from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api.schemas.form_logs import FormLogsRequestSchema
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services.form_logs import FormlogService

API = Namespace("FormLogs", description="Form logs")

@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class FormLogResource(Resource):
    

    @staticmethod
    # @auth.require
    @profiletime
    def post():
        form_logs_schema = FormLogsRequestSchema()
        form_logs_data =  form_logs_schema.load(request.json)
        formdata = FormlogService.create_form_log(form_logs_data)
        return (formdata,HTTPStatus.CREATED)

        
         
        
# @cors_preflight("GET,PUT,DELET,OPTIONS")
# @API.route("/<string:form_id>", methods=["GET","PUT","DELET", "OPTIONS"])
# class FormLogUpdateResource(Resource):
    
#     @staticmethod
#     def get(form_id: str):
#         """return the all logs agianst to a form id"""
#         try:
#             return FormLogsService.get_form_logs(form_id) 
#         except BusinessException as err:
#             current_app.logger.warning(err)
#             return err.error, err.status_code
            
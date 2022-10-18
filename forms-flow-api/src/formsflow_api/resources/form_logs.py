"""API endpoints for managing form resource."""

import json
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException

from formsflow_api_utils.utils import (
    auth,
    cors_preflight,
    profiletime,
)

 


API = Namespace("FormLogs", description="Form logs")



@cors_preflight("POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormLogs(Resource):

    @staticmethod
    @auth.require
    @profiletime
    def post():
        


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:form_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormLogsById(Resource):
    
"""API endpoints for managing form resource."""

from flask import current_app
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import FormlogService

API = Namespace("FormLogs", description="Form logs")

@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<string:form_id>", methods=["GET","OPTIONS"])
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

    
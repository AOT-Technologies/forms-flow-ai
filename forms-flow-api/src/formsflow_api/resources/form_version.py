"""API endpoints for managing form versions resource."""

from http import HTTPStatus
 
 

from flask import current_app, request
from flask_restx import Namespace, Resource
 
 
from formsflow_api.services import FormVersionService
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

 
 

API = Namespace("FormVersion", description="FormVersion")



@cors_preflight("GET")
@API.route("/form-revisions/<str:form_Id>", methods=["GET", "OPTIONS"])
class FormVersions(Resource):
    """Resource to get form versions."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_Id):
        """get all form versions."""
        try:
            if auth.has_role([DESIGNER_GROUP]):
                return  FormVersionService.get_form_versions(form_Id)
            else:
                return {
                    "type": "Authorization error",
                    "message": "Permission denied",
                }, HTTPStatus.FORBIDDEN
              
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

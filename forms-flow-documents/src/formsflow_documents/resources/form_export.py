"""API endpoints for managing form resource."""
import string
from http import HTTPStatus

from flask import current_app, make_response, render_template, request
from flask_restx import Namespace, Resource

from formsflow_api_utils.exceptions import BusinessException

from formsflow_api_utils.services import (
    FormioService,
)
from formsflow_api_utils.utils import (
    REVIEWER_GROUP,
    CLIENT_GROUP,
    auth,
    cors_preflight,
    profiletime,
)
from formsflow_api_utils.utils.pdf import get_pdf_from_html, pdf_response

API = Namespace("Form", description="Form")


@API.route("/<string:form_id>/submission/<string:submission_id>/render")
class FormResourceRenderFormPdf(Resource):
    """Resource to render form and submission details as html."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """Form rendering method."""
        formio_service = FormioService()
        form_io_url = current_app.config.get("FORMIO_URL")
        form_io_token = formio_service.get_formio_access_token()
        form_url = form_io_url + "/form/" + form_id + "/submission/" + submission_id
        template_params = {
            "form" : {
                "base_url": form_io_url,
                "project_url": form_io_url,
                "form_url": form_url,
                "token": form_io_token,
            }
        }
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template("index.html", **template_params), 200, headers
        )


@cors_preflight("GET,OPTIONS")
@API.route(
    "/<string:form_id>/submission/<string:submission_id>/export/pdf",
    methods=["GET", "OPTIONS"],
)
class FormResourceExportFormPdf(Resource):
    """Resource to export form and submission details as pdf."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """PDF generation and rendering method."""
        try:
            if auth.has_one_of_roles([REVIEWER_GROUP, CLIENT_GROUP]):
                token = request.headers.get("Authorization")
                host_name = current_app.config.get("FORMSFLOW_API_URL")
                url = (
                    host_name
                    + "/form/"
                    + form_id
                    + "/submission/"
                    + submission_id
                    + "/render"
                )
                file_name = (
                    "Application_" + form_id + "_" + submission_id + "_export.pdf"
                )
                result = get_pdf_from_html(url, wait="completed", auth_token=token)
                return pdf_response(result, file_name)

            response, status = (
                {
                    "message": "Permission Denied",
                },
                HTTPStatus.FORBIDDEN,
            )
            return response, status
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

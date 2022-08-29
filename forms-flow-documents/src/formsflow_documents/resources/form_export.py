"""API endpoints for managing form resource."""
import string
from http import HTTPStatus

from flask import current_app, make_response, render_template, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services import FormioService
from formsflow_api_utils.utils import (
    CLIENT_GROUP,
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)
from formsflow_api_utils.utils.pdf import get_pdf_from_html, pdf_response

API = Namespace("Form", description="Form")


@API.route("/<string:form_id>/submission/<string:submission_id>/render", doc=False)
class FormResourceRenderFormPdf(Resource):
    """Resource to render form and submission details as html."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """Form rendering method."""
        formio_service = FormioService()
        form_io_url = current_app.config.get("FORMIO_URL")
        is_form_adapter = current_app.config.get("CUSTOM_SUBMISSION_ENABLED")
        form_io_token = formio_service.get_formio_access_token()

        if is_form_adapter:
            sub_url = current_app.config.get("CUSTOM_SUBMISSION_URL")
            form_url = form_io_url + "/form/" + form_id
            submission_url = (
                sub_url + "/form/" + form_id + "/submission/" + submission_id
            )
            auth_token = request.headers.get("Authorization")
        else:
            form_url = form_io_url + "/form/" + form_id + "/submission/" + submission_id
            submission_url = None
            auth_token = None

        template_params = {
            "form": {
                "base_url": form_io_url,
                "project_url": form_io_url,
                "form_url": form_url,
                "token": form_io_token,
                "submission_url": submission_url,
                "form_apater": is_form_adapter,
                "auth_token": auth_token,
            }
        }
        current_app.logger.debug(template_params)
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template("index.html", **template_params), 200, headers
        )


@cors_preflight("GET,OPTIONS")
@API.route(
    "/<string:form_id>/submission/<string:submission_id>/export/pdf",
    methods=["GET", "OPTIONS"],
)
@API.doc(
    params={
        "timezone": {
            "description": "Timezone of client device eg: Asia/Calcutta",
            "in": "query",
            "type": "string",
        }
    }
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
                timezone = request.args.get("timezone")
                token = request.headers.get("Authorization")
                host_name = current_app.config.get("FORMSFLOW_DOC_API_URL")
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

                chromedriver = current_app.config.get("CHROME_DRIVER_PATH")

                args = {"wait": "completed", "timezone": timezone, "auth_token": token}
                current_app.logger.debug(args)
                current_app.logger.debug(url)
                result = get_pdf_from_html(url, chromedriver, args=args)
                if result:
                    return pdf_response(result, file_name)
                response, status = (
                    {
                        "message": "Cannot render pdf.",
                    },
                    HTTPStatus.BAD_REQUEST,
                )
                return response, status

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

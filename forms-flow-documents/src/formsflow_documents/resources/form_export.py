"""API endpoints for managing form resource."""
import string
from http import HTTPStatus

from flask import current_app, make_response, render_template, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    CLIENT_GROUP,
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)
from werkzeug.utils import secure_filename

from formsflow_documents.helpers import PdfHelpers

API = Namespace("Form", description="Form")


@API.route("/<string:form_id>/submission/<string:submission_id>/render", doc=False)
class FormResourceRenderFormPdf(Resource):
    """Resource to render form and submission details as html."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """Form rendering method."""
        pdf_helper = PdfHelpers(form_id=form_id, submission_id=submission_id)

        default_template = "index.html"
        template_name = request.args.get("template_name")
        use_template = bool(template_name)

        template_name = (
            pdf_helper.url_decode(secure_filename(template_name))
            if use_template
            else default_template
        )
        if not pdf_helper.search_template(template_name):
            raise BusinessException(
                "Template not found!", HTTPStatus.INTERNAL_SERVER_ERROR
            )

        render_data = pdf_helper.get_render_data(
            use_template, request.headers.get("Authorization")
        )
        current_app.logger.debug(render_data)
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template(template_name, **render_data), 200, headers
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
                template = request.args.get("template")
                token = request.headers.get("Authorization")
                use_template = bool(template)

                pdf_helper = PdfHelpers(form_id=form_id, submission_id=submission_id)

                template_name = None
                if use_template:
                    template_name = pdf_helper.create_template(template=template)
                    current_app.logger.info(template_name)
                assert pdf_helper.get_render_status(token, template_name) == 200
                result = pdf_helper.generate_pdf(timezone, token, template_name)
                if result:
                    if use_template:
                        pdf_helper.delete_template(template_name)
                    return result
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

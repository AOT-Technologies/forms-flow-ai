"""API endpoints for managing form resource."""

import string
from http import HTTPStatus

from flask import current_app, make_response, render_template, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    VIEW_SUBMISSIONS,
    auth,
    cors_preflight,
    profiletime,
)
from werkzeug.utils import secure_filename

from formsflow_documents.services import PDFService
from formsflow_documents.utils import DocUtils
from formsflow_documents.utils.constants import BusinessErrorCode

API = Namespace("Form", description="Form")


@API.route("/<string:form_id>/submission/<string:submission_id>/render", doc=False)
class FormResourceRenderPdf(Resource):
    """Resource to render form and submission details as html."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: string, submission_id: string):
        """Form rendering method."""
        current_app.logger.info(
            f"Inside Get RENDER form_id : {form_id}, submission_id : {submission_id}"
        )
        pdf_service = PDFService(form_id=form_id, submission_id=submission_id)
        current_app.logger.info("Created PDF Service class instance")
        default_template = "index.html"
        template_name = request.args.get("template_name")
        template_variable_name = request.args.get("template_variable")

        use_template = bool(template_name)
        current_app.logger.info(f"use_template : {use_template}")
        template_name = (
            DocUtils.url_decode(secure_filename(template_name))
            if use_template
            else default_template
        )

        current_app.logger.info(f"template_name : {template_name}")

        template_variable_name = (
            DocUtils.url_decode(secure_filename(template_variable_name))
            if template_variable_name
            else None
        )
        current_app.logger.info(f"template_variable_name : {template_variable_name}")
        if not pdf_service.search_template(template_name, is_temp=use_template):
            current_app.logger.error(
                "Template not found, raising TEMPLATE_NOT_FOUND error"
            )
            raise BusinessException(BusinessErrorCode.TEMPLATE_NOT_FOUND)

        if template_variable_name and not pdf_service.search_template(
            template_variable_name, is_temp=use_template
        ):
            current_app.logger.error(
                "Template vars not found, raising TEMPLATE_VARS_NOT_FOUND error"
            )
            raise BusinessException(BusinessErrorCode.TEMPLATE_VARS_NOT_FOUND)

        render_data = pdf_service.get_render_data(
            use_template, template_variable_name, request.headers.get("Authorization")
        )
        current_app.logger.info("Render data received")
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template(template_name, **render_data), 200, headers
        )


@cors_preflight("POST,OPTIONS")
@API.route(
    "/<string:form_id>/submission/<string:submission_id>/export/pdf",
    methods=["POST", "OPTIONS"],
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
class FormResourceExportPdf(Resource):
    """Resource to export form and submission details as pdf."""

    @staticmethod
    @auth.require
    @auth.has_one_of_roles([VIEW_SUBMISSIONS])
    @profiletime
    def post(form_id: string, submission_id: string):
        """PDF generation and rendering method."""
        timezone = request.args.get("timezone")
        request_json = request.get_json()
        template = request_json.get("template")
        template_variables = request_json.get("templateVars")
        token = request.headers.get("Authorization")
        use_template = bool(template)

        pdf_service = PDFService(form_id=form_id, submission_id=submission_id)

        template_name = None
        template_variable_name = None
        if use_template:
            (
                template_name,
                template_variable_name,
            ) = pdf_service.create_template(template, template_variables)
            current_app.logger.info(f"Custom template created : {template_name}")
            current_app.logger.info(
                f"Template variables created : {template_variable_name}"
            )
            return pdf_service.create_pdf_from_custom_template(
                template_name, template_variable_name, token, timezone
            )

        status = (
            pdf_service.get_render_status(  # pylint:disable = too-many-function-args
                token, template_name, template_variable_name
            )
        )
        current_app.logger.info(f"pdf_service.get_render_status : {status}")
        assert status == 200
        current_app.logger.info("Generating PDF...")
        result = pdf_service.generate_pdf(
            timezone, token, template_name, template_variable_name
        )
        if result:
            if use_template:
                current_app.logger.info("Removing temporary files...")
                pdf_service.delete_template(template_name)
                if template_variable_name:
                    pdf_service.delete_template(template_variable_name)
            return result
        response, status = (
            {
                "message": "Cannot render pdf.",
            },
            HTTPStatus.BAD_REQUEST,
        )
        return response, status

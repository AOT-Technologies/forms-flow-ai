"""API endpoints for managing form resource."""
import string
import uuid
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
from formsflow_api_utils.utils.pdf import get_pdf_from_html, pdf_response
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

        template_name = secure_filename(request.args.get("template_name"))
        default_template = "index.html"
        use_template = bool(template_name)
        template_file = (
            pdf_helper.url_decode(template_name) if use_template else default_template
        )
        # TODO: better exception handling
        if not pdf_helper.search_template(template_file):
            return "template not found"

        render_data = pdf_helper.get_render_data(
            use_template, request.headers.get("Authorization")
        )
        current_app.logger.debug(render_data)
        headers = {"Content-Type": "text/html"}
        return make_response(
            render_template(template_file, **render_data), 200, headers
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
                host_name = current_app.config.get("FORMSFLOW_DOC_API_URL")
                pdf_helper = PdfHelpers(form_id=form_id, submission_id=submission_id)
                url = (
                    host_name
                    + "/form/"
                    + form_id
                    + "/submission/"
                    + submission_id
                    + "/render"
                )

                use_template = bool(template)
                args = {"wait": "completed", "timezone": timezone, "auth_token": token}

                if use_template:
                    template_name = f"{str(uuid.uuid4())}.html"
                    current_app.logger.info(template_name)
                    pdf_helper.create_template(
                        template=template, template_name=template_name
                    )
                    url += f"?template_name={pdf_helper.url_encode(template_name)}"
                    # Dont have to wait for formio element when using custom template
                    del args["wait"]
                file_name = (
                    "Application_" + form_id + "_" + submission_id + "_export.pdf"
                )
                chromedriver = current_app.config.get("CHROME_DRIVER_PATH")
                current_app.logger.debug(args)
                current_app.logger.debug(url)
                result = get_pdf_from_html(url, chromedriver, args=args)
                if result:
                    pdf_helper.delete_template(template_name)
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

"""API endpoints for embeded forms."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from formsflow_api_utils.utils.enums import FormProcessMapperStatus

from formsflow_api.services import (
    CombineFormAndApplicationCreate,
    FormProcessMapperService,
)

API = Namespace("Embed", description="APIs for form embeding")

application_external_create_model = API.model(
    "ApplicationCreateExternal", {"formId": fields.String(), "data": fields.Raw()}
)
application_base_model = API.model(
    "ApplicationCreateResponse",
    {
        "applicationStatus": fields.String(),
        "created": fields.String(),
        "createdBy": fields.String(),
        "formId": fields.String(),
        "formProcessMapperId": fields.String(),
        "id": fields.Integer(),
        "modified": fields.String(),
        "modifiedBy": fields.String(),
        "processInstanceId": fields.String(),
        "submissionId": fields.String(),
    },
)


class EmbedCommonMethods:
    """Common methods for internal and external authentication."""

    @staticmethod
    def get(path):
        """Get form by form name."""
        try:
            formio_service = FormioService()
            formio_token = formio_service.get_formio_access_token()
            form = formio_service.get_form_by_path(path, formio_token)
            form_status = FormProcessMapperService.get_mapper_by_formid(form["_id"])
            if form_status["status"] == str(FormProcessMapperStatus.ACTIVE.value):
                return formio_service.get_form_by_path(path, formio_token)
            return (
                {"message": "Form not published"},
                HTTPStatus.BAD_REQUEST,
            )
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    def post(token=None):
        """Post a new application using the request body."""
        formio_url = current_app.config.get("FORMIO_URL")
        web_url = current_app.config.get("WEB_BASE_URL")
        data = request.get_json()
        try:
            (
                response,
                status,
            ) = CombineFormAndApplicationCreate.application_create_with_submission(
                data, formio_url, web_url, token
            )
            return response, status
        except BusinessException as err:
            return err.error, err.status_code


@cors_preflight("POST,OPTIONS")
@API.route("/external/application/create", methods=["POST", "OPTIONS"])
class ApplicationCreateExternal(Resource):
    """Resource for application creation."""

    @staticmethod
    @auth.require_custom
    @profiletime
    @API.doc(body=application_external_create_model)
    @API.response(201, "CREATED:- Successful request.", model=application_base_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Post a new application using the request body with external authentication.

        : data: form submission data as a dict as in form submission data.
        : formId:- Unique Id for the corresponding form
        e.g,
        ```
        {
            "formId" : "632208d9fbcab29c2ab1a097",
            "data" : {
                "firstName" : "John",
                "lastName" : "Doe",
                "contact": {
                    "addressLine1": "1234 Street",
                    "email" : "john.doe@example.com"
                    }
                }
        }
        ```
        """
        return EmbedCommonMethods.post()


@cors_preflight("GET,OPTIONS")
@API.route("/external/form/<string:path>", methods=["GET", "OPTIONS"])
class FormExternal(Resource):
    """Resource for Retrieving form."""

    @staticmethod
    @auth.require_custom
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get(path):
        """Get form by form name with external authentication."""
        return EmbedCommonMethods.get(path)


@cors_preflight("POST,OPTIONS")
@API.route("/internal/application/create", methods=["POST", "OPTIONS"])
class ApplicationCreateInternal(Resource):
    """Resource for application creation."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=application_external_create_model)
    @API.response(201, "CREATED:- Successful request.", model=application_base_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Post a new application using the request body with internal authentication.

        : data: form submission data as a dict as in form submission data.
        : formId:- Unique Id for the corresponding form
        e.g,
        ```
        {
            "formId" : "632208d9fbcab29c2ab1a097",
            "data" : {
                "firstName" : "John",
                "lastName" : "Doe",
                "contact": {
                    "addressLine1": "1234 Street",
                    "email" : "john.doe@example.com"
                    }
                }
        }
        ```
        """
        return EmbedCommonMethods.post(request.headers["Authorization"])


@cors_preflight("GET,OPTIONS")
@API.route("/internal/form/<string:path>", methods=["GET", "OPTIONS"])
class FormInternal(Resource):
    """Resource for Retrieving form."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get(path):
        """Get form by form name with internal authentication."""
        return EmbedCommonMethods.get(path)

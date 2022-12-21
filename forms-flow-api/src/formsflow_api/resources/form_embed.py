"""API endpoints for embeded forms."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import auth, cache, cors_preflight, profiletime
from jose import jwt as json_web_token

from formsflow_api.services import CombineFormAndApplicationCreate

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

# TODO: Deprecate this resource
@cors_preflight("POST,OPTIONS")
@API.route("/token", methods=["POST", "OPTIONS"])
class TokenResource(Resource):
    """Resource for jwt embed token."""

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
    def post():
        """Retrieve formio token for embed form."""
        try:
            data = g.token_info
            roles = cache.get("formio_role_ids")
            user_resource_id = cache.get("user_resource_id")
            if not roles or not user_resource_id:
                return (
                    {"error": "Unable to fetch role ids."},
                    HTTPStatus.SERVICE_UNAVAILABLE,
                )
            client_id = [role for role in roles if role["type"] == "CLIENT"][0][
                "roleId"
            ]
            payload = {
                "external": True,
                "form": {
                    "_id": user_resource_id,
                },
                "user": {"_id": data["email"], "roles": [client_id]},
            }
            formio_token = json_web_token.encode(
                claims=payload,
                key=current_app.config.get("FORMIO_JWT_SECRET"),
                algorithm="HS256",
            )
            response, status = {"access_token": formio_token}, HTTPStatus.OK
            return response, status

        except Exception as err:
            raise err


@cors_preflight("POST,OPTIONS")
@API.route("/application/create", methods=["POST", "OPTIONS"])
class ApplicationCreate(Resource):
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
        """Post a new application using the request body.

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
        formio_url = current_app.config.get("FORMIO_URL")
        web_url = current_app.config.get("WEB_BASE_URL")
        data = request.get_json()
        try:
            (
                response,
                status,
            ) = CombineFormAndApplicationCreate.application_create_with_submission(
                data, formio_url, web_url, request.headers["Authorization"]
            )
            return response, status
        except BusinessException as err:
            return err.error, err.status_code


@cors_preflight("GET,OPTIONS")
@API.route("/form/<string:path>", methods=["GET", "OPTIONS"])
class Form(Resource):
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
        """Get form by form name."""
        try:
            formio_service = FormioService()
            formio_token = formio_service.get_formio_access_token()
            return formio_service.get_form_by_path(path, formio_token)
        except BusinessException as err:
            return err.error, err.status_code

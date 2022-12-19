"""API endpoints for embeded forms."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import auth, cache, cors_preflight, profiletime
from jose import jwt as json_web_token

from formsflow_api.schemas import ApplicationSchema
from formsflow_api.services import ApplicationService

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
        application_json = request.get_json()
        data = request.get_json()
        try:
            application_schema = ApplicationSchema()
            application_data = application_schema.load(application_json)
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            formio_data = formio_service.post_submission(data, form_io_token)
            application_data["submission_id"] = formio_data["_id"]
            application_data[
                "form_url"
            ] = f"{formio_url}/form/{application_data['form_id']}/submission/{formio_data['_id']}"
            application_data[
                "web_form_url"
            ] = f"{web_url}/form/{application_data['form_id']}/submission/{formio_data['_id']}"
            application, status = ApplicationService.create_application(
                data=application_data, token=request.headers["Authorization"]
            )
            response = application_schema.dump(application)
            return response, status
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to formId-{application_data['form_id']} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except KeyError as err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BaseException as application_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status

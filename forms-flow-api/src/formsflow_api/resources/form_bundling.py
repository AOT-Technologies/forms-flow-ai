"""API endpoints for managing form bundle resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import FormBundleProcessMapperSchema
from formsflow_api.services import (
    FormBundleService,
    FormProcessMapperService,
    RuleEngine,
)

API = Namespace("Form Bundles", description="APIs for form bundled")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class BundleList(Resource):
    """Resource for managing bundle."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "CREATED:- Successful request.")
    @API.response(204, "NO_CONTENT:- Successful request but nothing follows.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    def post():
        """Create Form bundle.

        : data: bundle data for create bundle.
        e.g,
        ```
        {
            "formName":"sample",
            "description":"this is a bundle",
            "formId":"5165156dfdfadfdasf165",
            "formType":"bundle",
            "parentFormId":"dfdsfadsf455151",
            "selectedForms": [
            {
                "mapperId": "9",
                "path": "duplicate-version-26c6b8",
                "rules": [
                    "teaxt == pageYOffset", "age == 30"
                ],
                "formOrder":1,
                "parentFormId":"dfdsfadsf455151"
            },
            {
                "mapperId": "6",
                "path": "duplicate-version-b599e2",
                "rules": [
                    "teaxt == pageYOffset", "age == 30"
                ],
                "formOrder":2,
                "parentFormId":"dfdsfadsf455151"
            }
            ]
            }
        ```
        """
        mapper_json = request.get_json()
        try:
            mapper_schema = FormBundleProcessMapperSchema()
            mapper_data = mapper_schema.load(mapper_json)
            mapper = FormProcessMapperService.create_mapper(mapper_data)
            for form in mapper_data["selected_forms"]:
                form["form_process_mapper_id"] = mapper.id
            response = FormBundleService.create_bundle(mapper_data)
            return (
                {"BundleId": mapper.id},
                HTTPStatus.CREATED,
            )
        except BaseException as err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request passed",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/<int:mapper_id>/execute-rules", methods=["POST", "OPTIONS"])
class FormBundleExecuteRules(Resource):
    """Resource for form bundle rule execution."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Rules executed.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post(mapper_id: int):
        """Post submission data to execute bundle rules.

        : data: form submission data as a dict as in form submission data.
        : formId:- Unique Id for the corresponding form
        e.g,
        ```
        {
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
        try:
            return (
                RuleEngine.evaluate(
                    submission_data=request.get_json(),
                    mapper_id=mapper_id,
                    skip_rules=request.args.get(
                        "skipRules", default=False, type=bool
                    ),  # Pass it true to not execute
                    # rules and return all possible forms under the bundle. Useful for preview and list
                ),
                HTTPStatus.OK,
            )
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to mapper id {mapper_id} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
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


@cors_preflight("GET, OPTIONS")
@API.route("/<int:bundle_id>/forms", methods=["GET", "OPTIONS"])
@API.doc(params={"bundle_id": "Forms inside a bundle by bundle_id"})
class BundleFormsById(Resource):
    """Resource for listing forms inside a bundle."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
    )
    def get(bundle_id: int):
        """
        Get forms by bundle id.

        Get forms inside a bundle by bundle id.
        """
        try:
            response = FormBundleService.get_forms_bundle(bundle_id)
            return response, HTTPStatus.OK
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

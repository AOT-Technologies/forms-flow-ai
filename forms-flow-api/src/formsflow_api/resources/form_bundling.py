"""API endpoints for managing form bundle resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import FormBundleProcessMapperSchema
from formsflow_api.services import FormBundleService, RuleEngine

API = Namespace("Form Bundles", description="APIs for form bundled")

bundle_create_forms = API.model(
    "BundleCreateForms",
    {
        "parentFormId": fields.String(),
        "formOrder": fields.Integer(),
        "rules": fields.List(fields.String()),
    },
)
bundle_create_model = API.model(
    "BundleCreateModel",
    {"selectedForms": fields.List(fields.Nested(bundle_create_forms))},
)
bundle_update_forms = API.inherit(
    "BundleUpdateForms",
    bundle_create_forms,
    {
        "id": fields.Integer(),
    },
)
bundle_update_model = API.model(
    "BundleUpdateModel",
    {"selectedForms": fields.List(fields.Nested(bundle_update_forms))},
)
bundle_response = API.inherit(
    "BundleResponse",
    bundle_update_forms,
    {
        "formId": fields.String(),
        "formName": fields.String(),
        "formMapperId": fields.String(),
        "formType": fields.String(),
    },
)
execute_rule_request = API.model(
    "ExecuteRuleRequest",
    {
        "data": fields.Raw(),
    },
)


@cors_preflight("GET,POST,PUT, OPTIONS")
@API.route("", methods=["GET", "POST", "PUT", "OPTIONS"])
class BundleList(Resource):
    """Resource for managing bundle."""

    @staticmethod
    @auth.has_one_of_roles([DESIGNER_GROUP])
    @profiletime
    @API.doc(body=bundle_create_model)
    @API.response(201, "CREATED:- Successful request.", model=[bundle_response])
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
    def post(mapper_id: int):
        """Create Form bundle against a mapper.

        : data: bundle data for create bundle.
        e.g,
        ```
        {
            "selectedForms": [
            {
                "rules": [
                    "teaxt == pageYOffset", "age == 30"
                ],
                "formOrder":1,
                "parentFormId":"dfdsfadsf455151"
            },
            {
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
            # Mapper records has to be created first
            # mapper = FormProcessMapperService.create_mapper(mapper_data)
            for form in mapper_data["selected_forms"]:
                form["form_process_mapper_id"] = mapper_id
            FormBundleService.create_bundle(mapper_data)
            response = FormBundleService.get_bundle_by_id(mapper_id=mapper_id)

            return (
                response,
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

    @staticmethod
    @auth.has_one_of_roles([DESIGNER_GROUP])
    @profiletime
    @API.doc(body=bundle_update_model)
    @API.response(200, "CREATED:- Successful request.", model=[bundle_response])
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
    def put(mapper_id: int):
        """Update Form bundle against a mapper.

        : data: bundle data for update bundle.
        e.g,
        ```
        {
            "selectedForms": [
            {
                "rules": [
                    "teaxt == pageYOffset", "age == 30"
                ],
                "formOrder":1,
                "parentFormId":"dfdsfadsf455151",
                "id":1,
            },
            {
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
        bundle_json = request.get_json()
        try:
            bundle_schema = FormBundleProcessMapperSchema()
            bundle_data = bundle_schema.load(bundle_json)
            for form in bundle_data["selected_forms"]:
                form["form_process_mapper_id"] = mapper_id
            FormBundleService.update_bundle(mapper_id, bundle_data)
            response = FormBundleService.get_bundle_by_id(mapper_id=mapper_id)
            return (
                response,
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

    @staticmethod
    @auth.require
    @API.response(200, "OK:- Successful request.", model=[bundle_response])
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @profiletime
    def get(mapper_id: int):
        """Get bundle details by bundle id."""
        try:
            bundle_detail = FormBundleService.get_bundle_by_id(mapper_id)
            return (
                bundle_detail,
                HTTPStatus.OK,
            )
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error


@cors_preflight("POST,OPTIONS")
@API.route("/execute-rules", methods=["POST", "OPTIONS"])
class FormBundleExecuteRules(Resource):
    """Resource for form bundle rule execution."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=execute_rule_request)
    @API.response(200, "OK:- Rules executed.", model=[bundle_response])
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

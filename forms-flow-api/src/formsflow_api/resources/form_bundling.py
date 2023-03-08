"""API endpoints for form bundling."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import RuleEngine

API = Namespace("Form Bundles", description="APIs for form bundled")


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

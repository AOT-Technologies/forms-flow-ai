"""API endpoints for managing form bundle resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.schemas import FormBundleProcessMapperSchema
from formsflow_api.services import FormBundleService, FormProcessMapperService

API = Namespace("bundle", description="Bundle flow")


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

"""API endpoints for managing import."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.services import ImportService

API = Namespace("Import", description="Handles form and workflow import.")

form_edit_import_model = API.model(
    "FormEditImportModel",
    {
        "skip": fields.Boolean(description="Skip form import"),
        "selectedVersion": fields.String(description="Import as major/minor version"),
    },
)
workflow_edit_import_model = API.model(
    "WorkflowEditImportModel",
    {"skip": fields.Boolean(description="Skip workflow import")},
)

version_model = API.model(
    "VersionModel",
    {
        "majorVersion": fields.Integer(),
        "minorVersion": fields.Integer(),
    },
)
import_model = API.model(
    "ImportModel",
    {
        "importType": fields.String(
            description="New import or import on existing form - new/edit"
        ),
        "action": fields.String(
            description="Action to be performed - validate or import"
        ),
        "mapperId": fields.String(),
        "form": fields.Nested(form_edit_import_model),
        "workflow": fields.Nested(workflow_edit_import_model),
    },
)
import_request_model = API.model(
    "ImportRequestModel",
    {"file": fields.String(), "data": fields.Nested(import_model)},
)
import_validate_response_model = API.model(
    "ImportValidateResponseModel",
    {
        "form": fields.Nested(version_model),
        "workflow": fields.Nested(version_model),
    },
)


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class Import(Resource):
    """Resource to support import."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(
        200,
        "OK:- Successful request.",
        model=import_validate_response_model,
    )
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
    @API.expect(import_request_model)
    def post():
        """Import form and workflow.

        Import payload given as form-data with fields: file-as json file and data
        e.g payload ,
        Validate new import
        ```
        file: importfile.json
        data: {"importType":"new","action":"validate"}
        ```
        Import as new form and workflow
        ```
        file: importfile.json
        data: {"importType":"new","action":"import"}
        ```
        Validate import to an existing form
        ```
        file: importfile.json
        data: {"importType":"edit","action":"validate","mapperId":"123"}

        ```
        Import to an existing form
        ```
        file: importfile.json
        data: {
                "importType":"edit","action":"import","mapperId":"1009",
                "form":{"skip":false,"selectedVersion":"major"},"workflow":{"skip":false}
                }
        ```
        eg: response for validate import
        ```
        {
            "form": {
                "majorVersion": 1,
                "minorVersion": 0
            },
            "workflow": {
                "majorVersion": 1,
                "minorVersion": 0
            }
        }
        ```
        eg: response for import
        ```
        {
        "mapper": {
            "formId": "67a4b59b5c702e11810149f9",
            "formName": "testimport",
            "formType": "form",
            ...}
        "process": {
            "name": "testimport",
            "processData": ""
            ...}
        }
        ```
        """
        import_service = ImportService()
        return (
            import_service.import_form_workflow(request),
            HTTPStatus.OK,
        )

"""API endpoints for draft resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    CREATE_SUBMISSIONS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import ApplicationSchema, DraftSchema
from formsflow_api.services import DraftService

API = Namespace("Draft", description="Manage Drafts.")

message = API.model("Message", {"message": fields.String()})

draft = API.model(
    "Draft",
    {
        "data": fields.Raw(),
        "formId": fields.String(),
    },
)

draft_response = API.inherit(
    "DraftResponse",
    draft,
    {
        "CreatedBy": fields.String(),
        "DraftName": fields.String(),
        "applicationId": fields.Integer(),
        "created": fields.String(),
        "id": fields.Integer(),
        "modified": fields.String(),
        "processName": fields.String(),
    },
)


draft_create_response = API.model(
    "DraftCreated",
    {
        "applicationId": fields.Integer(),
        "created": fields.String(),
        "data": fields.Raw(),
        "id": fields.Integer(),
        "modified": fields.String(),
        "_id": fields.String(),
    },
)


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class DraftResource(Resource):
    """Resource for managing drafts."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_SUBMISSIONS])
    @profiletime
    @API.doc(body=draft)
    @API.response(201, "CREATED:- Successful request.", model=draft_create_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def post():
        """Create a new draft."""
        application_json = request.get_json()
        application_schema = ApplicationSchema()
        application_dict_data = application_schema.load(application_json)
        draft_json = request.get_json()
        draft_schema = DraftSchema()
        draft_dict_data = draft_schema.load(draft_json)
        token = request.headers["Authorization"]
        res = DraftService.create_new_draft(
            application_dict_data, draft_dict_data, token
        )
        response = draft_schema.dump(res)
        return response, HTTPStatus.CREATED

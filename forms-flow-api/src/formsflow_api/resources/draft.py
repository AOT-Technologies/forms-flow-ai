"""API endpoints for draft resource."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    NEW_APPLICATION_STATUS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import (
    ApplicationSchema,
    ApplicationSubmissionSchema,
    DraftListSchema,
    DraftSchema,
)
from formsflow_api.services import ApplicationService, DraftService

API = Namespace("Draft", description="Manage Drafts")

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

draft_response_by_id = API.inherit(
    "DraftResponseById", draft_response, {"processKey": fields.String()}
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

drafts = API.model(
    "Drafts",
    {
        "drafts": fields.List(
            fields.Nested(draft_response, description="List of drafts")
        ),
        "applicationCount": fields.Integer(),
        "totalCount": fields.Integer(),
    },
)

submission = API.model(
    "Submission",
    {
        "formId": fields.String(),
        "formUrl": fields.String(),
        "submissionId": fields.String(),
        "webFormUrl": fields.String(),
    },
)

submission_response = API.model(
    "SubmissionResponse",
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


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class DraftResource(Resource):
    """Resource for managing drafts."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "pageNo": {
                "in": "query",
                "description": "Page number for paginated results",
                "default": "1",
            },
            "limit": {
                "in": "query",
                "description": "Limit for paginated results",
                "default": "5",
            },
            "sortBy": {
                "in": "query",
                "description": "Specify field for sorting the results.",
                "default": "id",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
            },
            "DraftName": {
                "in": "query",
                "description": "Filter resources by form name.",
                "type": "string",
            },
            "id": {
                "in": "query",
                "description": "Filter resources by id.",
                "type": "int",
            },
            "modifiedFrom": {
                "in": "query",
                "description": "Filter resources by modified from.",
                "type": "string",
            },
            "modifiedTo": {
                "in": "query",
                "description": "Filter resources by modified to.",
                "type": "string",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=drafts)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get():
        """Retrieve drafts."""
        dict_data = DraftListSchema().load(request.args) or {}
        draft_list, count = DraftService.get_all_drafts(dict_data)
        application_count = ApplicationService.get_application_count(auth)
        result = {
            "drafts": draft_list,
            "totalCount": count,
            "applicationCount": application_count,
        }
        return (result, HTTPStatus.OK)

    @staticmethod
    @auth.require
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


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:draft_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class DraftResourceById(Resource):
    """Resource for managing draft by id."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=draft_response_by_id)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def get(draft_id: str):
        """Get draft by id."""
        return DraftService.get_draft(draft_id), HTTPStatus.OK

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=draft)
    @API.response(
        200,
        "OK:- Successful request. Returns ```str: success message```",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(draft_id: int):
        """Update draft details."""
        draft_json = request.get_json()
        draft_schema = DraftSchema()
        dict_data = draft_schema.load(draft_json)
        DraftService.update_draft(draft_id=draft_id, data=dict_data)
        return (
            f"Updated {draft_id} successfully",
            HTTPStatus.OK,
        )

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=message)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def delete(draft_id: int):
        """Delete draft."""
        DraftService.delete_draft(draft_id)
        return {"message": "Draft deleted successfully"}, HTTPStatus.OK


@cors_preflight("PUT, OPTIONS")
@API.route("/<int:draft_id>/submit", methods=["PUT", "OPTIONS"])
class DraftSubmissionResource(Resource):
    """Converts the given draft entry to actual submission."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(body=submission)
    @API.response(200, "OK:- Successful request.", model=submission_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(draft_id: str):
        """Updates the application and draft entry to create a new submission."""
        payload = request.get_json()
        token = request.headers["Authorization"]
        application_schema = ApplicationSubmissionSchema()
        dict_data = application_schema.load(payload)
        dict_data["application_status"] = NEW_APPLICATION_STATUS
        response = DraftService.make_submission_from_draft(dict_data, draft_id, token)
        res = ApplicationSchema().dump(response)
        return res, HTTPStatus.OK


@cors_preflight("POST, OPTIONS")
@API.route("/public/create", methods=["POST", "OPTIONS"])
class PublicDraftResource(Resource):
    """Public endpoints to support anonymous forms."""

    @staticmethod
    @profiletime
    @API.doc(body=draft)
    @API.response(201, "CREATED:- Successful request.", model=draft_create_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def post():
        """Create a new draft submission."""
        application_json = draft_json = request.get_json()
        application_schema = ApplicationSchema()
        draft_schema = DraftSchema()

        application_dict_data = application_schema.load(application_json)
        draft_dict_data = draft_schema.load(draft_json)
        res = DraftService.create_new_draft(application_dict_data, draft_dict_data)
        response = draft_schema.dump(res)
        return response, HTTPStatus.CREATED


@cors_preflight("PUT, OPTIONS")
@API.route("/public/<int:draft_id>/submit", methods=["PUT", "OPTIONS"])
class PublicDraftResourceById(Resource):
    """Public endpoints for anonymous draft."""

    @staticmethod
    @profiletime
    @API.doc(body=submission)
    @API.response(200, "OK:- Successful request.", model=submission_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(draft_id: int):
        """Updates the application and draft entry to create a new submission."""
        payload = request.get_json()
        application_schema = ApplicationSubmissionSchema()
        dict_data = application_schema.load(payload)
        dict_data["application_status"] = NEW_APPLICATION_STATUS
        response = DraftService.make_submission_from_draft(dict_data, draft_id)
        res = ApplicationSchema().dump(response)
        return res, HTTPStatus.OK


@cors_preflight("PUT, OPTIONS")
@API.route("/public/<int:draft_id>", methods=["PUT", "OPTIONS"])
class PublicDraftUpdateResourceById(Resource):
    """Resource for updating the anonymous draft."""

    @staticmethod
    @profiletime
    @API.doc(body=draft)
    @API.response(
        200,
        "OK:- Successful request. Returns ```str: success message```",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(draft_id: int):
        """Update draft details."""
        draft_json = request.get_json()
        draft_schema = DraftSchema()
        dict_data = draft_schema.load(draft_json)
        DraftService.update_draft(draft_id=draft_id, data=dict_data)
        return (
            f"Updated {draft_id} successfully",
            HTTPStatus.OK,
        )

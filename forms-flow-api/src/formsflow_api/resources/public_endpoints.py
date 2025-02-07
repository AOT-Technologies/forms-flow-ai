"""API endpoints for managing anonymous applications."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    ANONYMOUS_USER,
    NEW_APPLICATION_STATUS,
    cors_preflight,
    profiletime,
    submission_response,
)

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import FormProcessMapper
from formsflow_api.schemas import (
    ApplicationSchema,
    ApplicationSubmissionSchema,
    DraftSchema,
)
from formsflow_api.services import ApplicationService, DraftService

API = Namespace("Public", description="Public APIs.")

application_create_model = API.model(
    "AnonymousApplicationCreate",
    {
        "data": fields.Raw(),
        "formId": fields.String(),
        "submissionId": fields.String(),
        "formUrl": fields.String(),
        "webFormUrl": fields.String(),
    },
)

anonymous_application_response_model = API.model(
    "AnonymousApplicationCreateResponse", submission_response
)

check_response = API.model(
    "CheckStatus", {"is_anonymous": fields.Boolean(), "status": fields.String()}
)

draft = API.model(
    "Draft",
    {
        "data": fields.Raw(),
        "formId": fields.String(),
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

draft_update_model = API.model(
    "DraftUpdate",
    {"data": fields.Raw()},
)


@cors_preflight("POST,OPTIONS")
@API.route("/application/create", methods=["POST", "OPTIONS"])
class ApplicationAnonymousResourcesByIds(Resource):
    """Resource for anonymous application creation."""

    @staticmethod
    @profiletime
    @API.doc(body=application_create_model)
    @API.response(
        201, "CREATED:- Successful request.", model=anonymous_application_response_model
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def post():
        """Post a new anonymous application using the request body."""
        application_json = request.get_json()
        application_schema = ApplicationSchema()
        dict_data = application_schema.load(application_json)
        mapper = FormProcessMapper.find_form_by_form_id(dict_data["form_id"])
        if mapper is None:
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND)

        is_anonymous = mapper.is_anonymous
        status = mapper.status
        if not is_anonymous or status != "active":
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)

        dict_data["created_by"] = ANONYMOUS_USER
        application, status = ApplicationService.create_application(
            data=dict_data, token=None
        )
        response = application_schema.dump(application)
        return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/form/<string:form_id>", methods=["GET", "OPTIONS"])
class AnonymousResourceById(Resource):
    """Resource to check form is Anonymous and published."""

    @staticmethod
    @profiletime
    @API.response(200, "OK:- Successful request.", model=check_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def get(form_id: str):
        """Check if the form is anonymous and published."""
        mapper = FormProcessMapper.find_form_by_form_id(form_id)
        if mapper is None:
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND)

        return (
            {
                "is_anonymous": bool(mapper.is_anonymous),
                "status": mapper.status,
            },
            HTTPStatus.OK,
        )


@cors_preflight("POST, OPTIONS")
@API.route("/draft", methods=["POST", "OPTIONS"])
class PublicDraftResource(Resource):
    """Resource for anonymous draft creation."""

    @staticmethod
    @profiletime
    @API.doc(body=draft)
    @API.response(201, "CREATED:- Successful request.", model=draft_create_response)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def post():
        """Create a new anonymous draft submission."""
        application_json = draft_json = request.get_json()
        application_schema = ApplicationSchema()
        draft_schema = DraftSchema()

        application_dict_data = application_schema.load(application_json)
        draft_dict_data = draft_schema.load(draft_json)
        res = DraftService.create_new_draft(application_dict_data, draft_dict_data)
        response = draft_schema.dump(res)
        return response, HTTPStatus.CREATED


@cors_preflight("PUT, OPTIONS")
@API.route("/application/<int:application_id>/submit", methods=["PUT", "OPTIONS"])
class PublicDraftSubmissionResource(Resource):
    """Converts the given anonymous draft entry to actual submission."""

    @staticmethod
    @profiletime
    @API.doc(body=application_create_model)
    @API.response(
        200, "OK:- Successful request.", model=anonymous_application_response_model
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(application_id: int):
        """Updates the draft entry to actual submission."""
        payload = request.get_json()
        application_schema = ApplicationSubmissionSchema()
        dict_data = application_schema.load(payload)
        dict_data["application_status"] = NEW_APPLICATION_STATUS
        response = DraftService.make_submission_from_draft(dict_data, application_id)
        res = ApplicationSchema().dump(response)
        return res, HTTPStatus.OK


@cors_preflight("PUT, OPTIONS")
@API.route("/application/<int:application_id>", methods=["PUT", "OPTIONS"])
class PublicDraftUpdateResourceById(Resource):
    """Resource for updating the anonymous draft."""

    @staticmethod
    @profiletime
    @API.doc(body=draft_update_model)
    @API.response(
        200,
        "OK:- Successful request. Returns ```str: success message```",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(application_id: int):
        """Update draft details."""
        input_json = request.get_json()
        application_schema = ApplicationSchema()
        dict_data = application_schema.load(input_json)
        ApplicationService.update_application(application_id, data=dict_data)
        return (
            f"Updated {application_id} successfully",
            HTTPStatus.OK,
        )

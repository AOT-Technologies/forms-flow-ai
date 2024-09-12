"""API endpoints for managing form resource."""

import json
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    CREATE_FILTERS,
    CREATE_SUBMISSIONS,
    MANAGE_ALL_FILTERS,
    VIEW_DESIGNS,
    VIEW_FILTERS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import (
    FormProcessMapperListRequestSchema,
    FormProcessMapperSchema,
)
from formsflow_api.services import (
    ApplicationService,
    FilterService,
    FormHistoryService,
    FormProcessMapperService,
)


class NullableString(fields.String):
    """Extending String field to be nullable."""

    __schema_type__ = ["string", "null"]
    __schema_example__ = "nullable string"


API = Namespace("Form", description="Form")

form_list_model = API.model(
    "FormList",
    {
        "forms": fields.List(
            fields.Nested(
                API.model(
                    "Form",
                    {
                        "formId": fields.String(),
                        "formName": fields.String(),
                        "id": fields.String(),
                        "processKey": fields.String(),
                    },
                )
            )
        ),
        "totalCount": fields.Integer(),
        "pageNo": fields.Integer(),
        "limit": fields.Integer(),
    },
)

mapper_create_model = API.model(
    "CreateMapper",
    {
        "anonymous": fields.Boolean(),
        "formId": fields.String(),
        "formName": fields.String(),
        "formRevisionNumber": fields.String(),
        "formType": fields.String(),
        "parentFormId": fields.String(),
    },
)

mapper_create_response_model = API.model(
    "MapperCreateResponse",
    {
        "anonymous": fields.Boolean(),
        "comments": NullableString(),
        "created": fields.String(),
        "createdBy": fields.String(),
        "formId": fields.String(),
        "formName": fields.String(),
        "id": fields.String(),
        "modified": fields.String(),
        "modifiedBy": NullableString(),
        "processKey": fields.String(),
        "processName": fields.String(),
        "processTenant": NullableString(),
        "status": NullableString(),
        "taskVariable": fields.String(),
        "version": fields.String(),
    },
)

mapper_update_model = API.model(
    "MapperUpdate",
    {
        "formId": fields.String(),
        "formName": fields.String(),
        "status": fields.String(),
        "taskVariable": fields.String(),
        "anonymous": fields.Boolean(),
        "processKey": fields.String(),
        "processName": fields.String(),
        "id": fields.String(),
    },
)

application_count_model = API.model(
    "ApplicationCount", {"message": fields.String(), "value": fields.Integer()}
)

task_variable_response_model = API.model(
    "TaskVariableResponse",
    {
        "processName": fields.String(),
        "processKey": fields.String(),
        "processTenant": NullableString(),
        "taskVariable": fields.String(),
    },
)

access_model = API.model(
    "SubmissionAccess",
    {"type": fields.String(), "roles": fields.List(fields.String())},
)
form_create_model = API.model(
    "FormCreate",
    {
        "title": fields.String(),
        "tags": fields.List(fields.String()),
        "submissionAccess": fields.List(fields.Nested(access_model)),
        "path": fields.String(),
        "name": fields.String(),
        "display": fields.String(),
        "components": fields.List(fields.Raw()),
        "access": fields.List(fields.Nested(access_model)),
    },
)

form_create_response_model = API.inherit(
    "FormCreateResponse",
    {
        "_id": fields.String(),
        "machineName": fields.String(),
        "owner": fields.String(),
        "created": fields.String(),
        "modified": fields.String(),
    },
)
form_history_change_log_model = API.model(
    "formHistoryChangeLog",
    {"clone_id": fields.String(), "new_version": fields.Boolean()},
)
form_history_response_model = API.inherit(
    "FormHistoryResponse",
    {
        "id": fields.String(),
        "form_id": fields.String(),
        "created_by": fields.String(),
        "created": fields.String(),
        "change_log": fields.Nested(form_history_change_log_model),
    },
)
forms_list_model = API.model(
    "Forms List Model",
    {"formTitle": fields.String(), "type": fields.String(), "content": fields.Raw()},
)
workflows_list_model = API.model(
    "Workflows List",
    {
        "processKey": fields.String(),
        "processName": fields.String(),
        "type": fields.String(),
        "content": fields.String(),
    },
)
dmns_list_model = API.model(
    "DMN List",
    {"key": fields.String(), "type": fields.String(), "content": fields.String()},
)
resource_details_model = API.model("resource_details", {"name": fields.String()})

authorization_model = API.model(
    "Authorization",
    {
        "resourceId": fields.String(),
        "resourceDetails": fields.Nested(resource_details_model),
        "roles": fields.List(fields.String),
        "userName": fields.String(),
    },
)

authorization_list_model = API.model(
    "Authorization List",
    {
        "APPLICATION": fields.Nested(authorization_model),
        "FORM": fields.Nested(authorization_model),
        "DESIGNER": fields.Nested(authorization_model),
    },
)
export_response_model = API.model(
    "ExportResponse",
    {
        "forms": fields.List(fields.Nested(forms_list_model)),
        "workflows": fields.List(fields.Nested(workflows_list_model)),
        "rules": fields.List(fields.Nested(dmns_list_model)),
        "authorizations": fields.List(fields.Nested(authorization_list_model)),
    },
)


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class FormResourceList(Resource):
    """Resource for getting forms."""

    @staticmethod
    @auth.has_one_of_roles(
        [
            CREATE_DESIGNS,
            VIEW_DESIGNS,
            CREATE_SUBMISSIONS,
            CREATE_FILTERS,
            VIEW_FILTERS,
            MANAGE_ALL_FILTERS,
        ]
    )
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
                "description": "Name of column to sort by.",
                "default": "id",
            },
            "sortOrder": {
                "in": "query",
                "description": "Specify sorting  order.",
                "default": "desc",
            },
            "search": {
                "in": "query",
                "description": "Retrieve form list based on form name or description.",
                "default": "",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=form_list_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def get():  # pylint: disable=too-many-locals
        """Get form process mapper."""
        dict_data = FormProcessMapperListRequestSchema().load(request.args) or {}
        search: str = dict_data.get("search", "")
        page_no: int = dict_data.get("page_no")
        limit: int = dict_data.get("limit")
        sort_by: str = dict_data.get("sort_by", "")
        sort_order: str = dict_data.get("sort_order", "")
        form_type: str = dict_data.get("form_type", None)
        is_active = dict_data.get("is_active", None)
        active_forms = dict_data.get("active_forms", None)

        sort_by = sort_by.split(",")
        sort_order = sort_order.split(",")
        if form_type:
            form_type = form_type.split(",")
        if search:
            search = search.replace("%", r"\%").replace("_", r"\_")
            search = [key for key in search.split(" ") if key.strip()]

        (
            form_process_mapper_schema,
            form_process_mapper_count,
        ) = FormProcessMapperService.get_all_forms(
            page_number=page_no,
            limit=limit,
            search=search if search else [],
            sort_by=sort_by,
            sort_order=sort_order,
            form_type=form_type,
            is_active=is_active,
            is_designer=auth.has_any_role([CREATE_DESIGNS, VIEW_DESIGNS]),
            active_forms=active_forms,
        )
        return (
            (
                {
                    "forms": form_process_mapper_schema,
                    "totalCount": form_process_mapper_count,
                    "pageNo": page_no,
                    "limit": limit,
                }
            ),
            HTTPStatus.OK,
        )

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(body=mapper_create_model)
    @API.response(
        200, "CREATED:- Successful request.", model=mapper_create_response_model
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Post a form process mapper using the request body."""
        mapper_json = request.get_json()
        response = FormProcessMapperService.mapper_create(mapper_json)
        return response, HTTPStatus.CREATED


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:mapper_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class FormResourceById(Resource):
    """Resource for managing forms by mapper_id."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(200, "OK:- Successful request.", model=mapper_create_response_model)
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
    def get(mapper_id: int):
        """Get form by mapper_id."""
        return (
            FormProcessMapperService.get_mapper(form_process_mapper_id=mapper_id),
            HTTPStatus.OK,
        )

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
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
    @API.response(
        403,
        "FORBIDDEN:- Authorization will not help.",
    )
    def delete(mapper_id: int):
        """Delete form by mapper_id."""
        FormProcessMapperService.mark_inactive_and_delete(
            form_process_mapper_id=mapper_id
        )
        return "Deleted", HTTPStatus.OK

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @API.doc(body=mapper_update_model)
    @API.response(
        200, "CREATED:- Successful request.", model=mapper_create_response_model
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
    def put(mapper_id: int):
        """Update form by mapper_id."""
        application_json = request.get_json()

        if "taskVariable" in application_json:
            FilterService.update_filter_variables(
                application_json.get("taskVariable"), application_json.get("formId")
            )
            application_json["taskVariable"] = json.dumps(
                application_json.get("taskVariable")
            )
        mapper_schema = FormProcessMapperSchema()
        dict_data = mapper_schema.load(application_json)
        mapper = FormProcessMapperService.update_mapper(
            form_process_mapper_id=mapper_id, data=dict_data
        )
        response = mapper_schema.dump(mapper)
        response["taskVariable"] = json.loads(response["taskVariable"])
        FormHistoryService.create_form_logs_without_clone(data=application_json)

        return (
            response,
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class FormResourceByFormId(Resource):
    """Resource for managing forms by corresponding form_id."""

    @staticmethod
    @auth.has_one_of_roles(
        [
            CREATE_DESIGNS,
            VIEW_DESIGNS,
            CREATE_SUBMISSIONS,
            CREATE_FILTERS,
            VIEW_FILTERS,
            MANAGE_ALL_FILTERS,
        ]
    )
    @profiletime
    @API.response(
        200, "CREATED:- Successful request.", model=mapper_create_response_model
    )
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
    def get(form_id: str):
        """Get form by form_id.

        : form_id:- Get details of only form corresponding to a particular formId
        """
        response = FormProcessMapperService.get_mapper_by_formid(form_id=form_id)
        task_variable = response.get("taskVariable")
        response["taskVariable"] = json.loads(task_variable) if task_variable else None
        return (
            response,
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/<int:mapper_id>/application/count", methods=["GET", "OPTIONS"])
class FormResourceApplicationCount(Resource):
    """Resource for getting applications count according to a mapper id."""

    @staticmethod
    @auth.has_one_of_roles(
        [
            CREATE_DESIGNS,
            VIEW_DESIGNS,
            CREATE_SUBMISSIONS,
        ]
    )
    @profiletime
    @API.response(200, "OK:- Successful request.", model=application_count_model)
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
    def get(mapper_id: int):
        """The method retrieves the total application count for the given mapper id."""
        FormProcessMapperService.check_tenant_authorization(mapper_id=mapper_id)
        (
            response,
            status,
        ) = ApplicationService.get_total_application_corresponding_to_mapper_id(
            mapper_id
        )
        return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/applicationid/<int:application_id>", methods=["GET", "OPTIONS"])
class FormResourceTaskVariablesbyApplicationId(Resource):
    """Resource to get task filter variables of a form based on application id."""

    @staticmethod
    @auth.require
    @profiletime
    @API.response(200, "OK:- Successful request.", model=task_variable_response_model)
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
    def get(application_id: int):
        """The method retrieves task variables based on application id."""
        return (
            ApplicationService.get_application_form_mapper_by_id(application_id),
            HTTPStatus.OK,
        )


@cors_preflight("POST,OPTIONS")
@API.route("/form-design", methods=["POST", "OPTIONS"])
class FormioFormResource(Resource):
    """Resource for formio form creation."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(body=form_create_model)
    @API.response(
        200, "CREATED:- Successful request.", model=form_create_response_model
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
    def post():
        """Formio form creation method."""
        try:
            data = request.get_json()
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            response, status = (
                formio_service.create_form(data, form_io_token),
                HTTPStatus.CREATED,
            )
            FormHistoryService.create_form_log_with_clone(
                data={
                    **response,
                    "parentFormId": data.get("parentFormId"),
                    "newVersion": data.get("newVersion"),
                    "componentChanged": True,
                }
            )
            return response, status
        except BusinessException as err:
            message = (
                err.details[0]["message"]
                if hasattr(err, "details") and err.details
                else err.message
            )
            return message, err.status_code


@cors_preflight("PUT,OPTIONS")
@API.route("/form-design/<string:form_id>", methods=["PUT", "OPTIONS"])
class FormioFormUpdateResource(Resource):
    """Resource for formio form Update."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    def put(form_id: str):
        """Formio form update method."""
        try:
            data = request.get_json()
            response = FormProcessMapperService.form_design_update(data, form_id)
            return response, HTTPStatus.OK
        except BusinessException as err:
            message = (
                err.details[0]["message"]
                if hasattr(err, "details") and err.details
                else err.message
            )
            return message, err.status_code


@cors_preflight("GET,OPTIONS")
@API.route("/form-history/<string:form_id>", methods=["GET", "OPTIONS"])
class FormHistoryResource(Resource):
    """Resource for form history."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.doc(body=form_create_model)
    @API.response(200, "OK:- Successful request.", model=form_history_response_model)
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
    def get(form_id: str):
        """Getting form history."""
        FormProcessMapperService.check_tenant_authorization_by_formid(form_id=form_id)
        return FormHistoryService.get_all_history(form_id)


@cors_preflight("GET,OPTIONS")
@API.route("/<int:mapper_id>/export", methods=["GET", "OPTIONS"])
class ExportById(Resource):
    """Resource to support export by mapper_id."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(200, "OK:- Successful request.", model=export_response_model)
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
    def get(mapper_id: int):
        """Export by mapper_id."""
        form_service = FormProcessMapperService()
        return (
            form_service.export(mapper_id),
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/validate", methods=["GET", "OPTIONS"])
class ValidateFormName(Resource):
    """Resource for validating a form name."""

    @staticmethod
    @auth.has_one_of_roles([CREATE_DESIGNS])
    @profiletime
    @API.response(200, "OK:- Successful request.")
    @API.response(400, "BAD_REQUEST:- Invalid request.")
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(403, "FORBIDDEN:- Authorization will not help.")
    def get():
        """Handle GET requests for validating form names.

        Retrieves the query parameters from the request, validates the form name,
        and returns a response indicating whether the form name is valid or not.
        """
        response = FormProcessMapperService.validate_form_name_path_title(request)
        return response, HTTPStatus.OK

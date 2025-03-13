
"""Maintain API docs models used."""

from flask_restx import fields, Namespace

submission_response = {
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
    "isResubmit": fields.Boolean(),
    "eventName": fields.String(),
    "isDraft": fields.Boolean(),
}

API = Namespace(
    "Authorization",
)
resource_details_model = API.model("resource_details", {"name": fields.String()})

authorization_model = API.model(
    "Authorization",
    {
        "resourceId": fields.String(),
        "resourceDetails": fields.Nested(resource_details_model),
        "roles": fields.List(fields.String(), description="Authorized Roles"),
        "userName": fields.String(description="UserName can be null or string"),
    },
)

authorization_list_model = API.model(
    "AuthorizationList",
    {
        "APPLICATION": fields.Nested(authorization_model),
        "FORM": fields.Nested(authorization_model),
        "DESIGNER": fields.Nested(authorization_model),
    },
)
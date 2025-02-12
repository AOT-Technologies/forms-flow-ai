
"""Maintain API docs models used."""

from flask_restx import fields

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
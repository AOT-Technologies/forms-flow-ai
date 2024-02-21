"""Application Specific Exceptions, to manage the business errors.

BusinessException - error, status_code - Business rules error
error - a description of the error {code / description: classname / full text}
status_code - where possible use HTTP Error Codes
"""
from enum import Enum
from http import HTTPStatus

import requests
import sentry_sdk
from flask_jwt_oidc import AuthError
from marshmallow.exceptions import ValidationError
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError


class ErrorCodeMixin:

    @property
    def code(self):
        return self.name

    @property
    def message(self):
        pass

    @property
    def status_code(self):
        pass


class ExternalError(ErrorCodeMixin, Enum):
    INSIGHTS_SERVICE_UNAVAILABLE = "Insights service is not available", HTTPStatus.SERVICE_UNAVAILABLE
    BPM_SERVICE_UNAVAILABLE = "BPM service is not available", HTTPStatus.SERVICE_UNAVAILABLE
    FORM_SERVICE_UNAVAILABLE = "Form service is not available", HTTPStatus.SERVICE_UNAVAILABLE
    ERROR_RESPONSE_RECEIVED = "Error response received from server", HTTPStatus.BAD_REQUEST
    UNAUTHORIZED = "Invalid Token", HTTPStatus.UNAUTHORIZED

    def __new__(cls, message, status_code):
        obj = object.__new__(cls)
        obj._value = status_code
        obj._message = message
        return obj

    @property
    def message(self):
        return self._message

    @property
    def status_code(self):
        return self._value


class BusinessException(Exception):
    """Exception that adds error code and error."""

    def __init__(self, error_code: ErrorCodeMixin, details=None, detail_message=None):
        super().__init__(error_code.message)
        self.message = error_code.message
        self.code = error_code.code
        self.status_code = error_code.status_code
        if detail_message:
            details = [dict(
                code="ERROR_DETAILS",
                message=detail_message
            )]
        self.details = details or []


class ErrorResponse:
    def __init__(self, message, code="", details=None):
        self.message = message
        self.code = code
        self.details = details or []


class ErrorDetail:
    def __init__(self, code, message):
        self.code = code
        self.message = message


def create_error_response(message, code="", error_details=None):
    return ErrorResponse(message, code, error_details)


def create_error_detail(code, message):
    return ErrorDetail(code, message)


def handle_sqlalchemy_error(e, model=None):
    error_message = "Database error occurred"
    error_code = "database_error"
    details = []

    if isinstance(e, SQLAlchemyError) and model:
        for column in model.__table__.columns:
            if column.nullable is False:
                details.append(
                    create_error_detail(
                        f"mandatory_field_missing_{column.name}",
                        f"Mandatory field '{column.name}' is missing"
                    )
                )

    # Customize the error message and code based on the SQLAlchemy exception
    if isinstance(e, SQLAlchemyError):
        error_message = "Database operation failed"
        error_code = "database_operation_failed"

    raise BusinessException(error_message, code=error_code, details=details)


def register_error_handlers(api, sentry_capture_handled_errors: bool = False):
    @api.errorhandler(AuthError)
    def handle_forbidden_error(error):
        error_response = create_error_response("Invalid Token Error", code="INVALID_AUTH_TOKEN")
        _report_error(error_response)
        return error_response.__dict__, error.status_code

    def _report_error(error_response: ErrorResponse):
        if sentry_capture_handled_errors:
            _message = f"{error_response.code} : {error_response.message}"
            if error_response.details:
                _message = f"{_message} - {error_response.details}"
            sentry_sdk.capture_message(_message)

    @api.errorhandler(BusinessException)
    def handle_business_error(error):
        error_response = create_error_response(error.message, error.code, error.details)
        _report_error(error_response)
        return error_response.__dict__, error.status_code

    @api.errorhandler(ValidationError)
    def handle_validation_error(error):
        error_details = [ErrorDetail(field, messages[0]).__dict__ for field, messages in error.messages.items()]
        error_response = ErrorResponse(message="Validation failed", code="VALIDATION_ERROR", details=error_details)
        error.data = error_response.__dict__
        _report_error(error_response)
        return error_response.__dict__, 400

    @api.errorhandler(KeyError)
    def handle_key_error(error):
        error_detail = ErrorDetail(code="KeyError", message=str(error))
        error_response = ErrorResponse(message="KeyError occurred", code="KEY_ERROR", details=[error_detail.__dict__])
        _report_error(error_response)
        return error_response.__dict__, 400

    @api.errorhandler(requests.exceptions.HTTPError)
    def handle_http_error(error):
        error_response = ErrorResponse(message="HttpError occurred", code="HTTP_ERROR", details=[])
        _report_error(error_response)
        return error_response.__dict__, 400


def register_db_error_handlers(db):
    @event.listens_for(db, 'handle_error')
    def handle_sqlalchemy_exceptions(context):
        handle_sqlalchemy_error(context.original_exception)

"""App Constants.

Constants file needed for the static values.
"""
from enum import Enum
from http import HTTPStatus

from formsflow_api_utils.exceptions import ErrorCodeMixin


class BusinessErrorCode(ErrorCodeMixin, Enum):
    """Business error codes."""

    TEMPLATE_NOT_FOUND = "Template not found!", HTTPStatus.BAD_REQUEST
    TEMPLATE_VARS_NOT_FOUND = "Template variables not found!", HTTPStatus.BAD_REQUEST
    URL_DECODE_FAILED = "URL Decode failed", HTTPStatus.BAD_REQUEST
    TEMPLATE_DECODE_FAILED = "Template Decode failed", HTTPStatus.BAD_REQUEST

    def __new__(cls, message, status_code):
        """Constructor."""
        obj = object.__new__(cls)
        obj._value = status_code
        obj._message = message
        return obj

    @property
    def message(self):
        """Return message."""
        return self._message

    @property
    def status_code(self):
        """Return status code."""
        return self._value

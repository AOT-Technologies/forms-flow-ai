"""Utility module for Document generation."""
import base64
import urllib.parse
from http import HTTPStatus

from formsflow_api_utils.exceptions import BusinessException

from formsflow_documents.filters import is_b64image


class DocUtils:
    """Utility class for Document generation."""

    @staticmethod
    def is_camel_case(string_val: str) -> bool:
        """Checks if the given string is camelcase or not."""
        if not isinstance(string_val, str) or is_b64image(string_val):
            return False
        string_val = string_val[1:]
        if " " in string_val:
            return False
        return (
            string_val != string_val.lower()
            and string_val != string_val.upper()
            and "_" not in string_val
        )

    @staticmethod
    def url_decode(template: str) -> str:
        """Decodes the url encoded payload with utf-8 charset."""
        try:
            return urllib.parse.unquote(template)
        except Exception as err:
            raise BusinessException(
                {"message": "URL decode failed!"}, HTTPStatus.BAD_REQUEST
            ) from err

    @staticmethod
    def b64decode(template: str) -> str:
        """
        Decodes the base64 encoded payload with utf-8 charset.

        template: base64 encoded data, the data should be properly
        url decoded if payload is sent through url.
        """
        try:
            return base64.b64decode(template).decode("utf-8")
        except Exception as err:
            raise BusinessException(
                {"message": "Failed to decode template!"}, HTTPStatus.BAD_REQUEST
            ) from err

"""This exposes the Formio APIs."""
import json
from http import HTTPStatus

import jwt
import requests
from flask import current_app

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import Cache
from formsflow_api_utils.exceptions import ExternalError


class FormioService:
    """This class manages formio API calls."""

    def __init__(self):
        """Initializing the service."""
        self.base_url = current_app.config.get("FORMIO_URL")

    @classmethod
    def decode_timeout(cls, token):
        """Method to decode token and get timeout."""
        token = jwt.decode(token, options={"verify_signature": False})
        timeout = token["exp"] - token["iat"]
        return timeout

    def get_formio_access_token(self):
        """Method to get formio access token."""
        formio_token = Cache.get("formio_token")
        if formio_token is None:
            formio_token = self.generate_formio_token()
            Cache.set(
                "formio_token",
                formio_token,
                timeout=self.decode_timeout(formio_token),
            )
        return formio_token

    def generate_formio_token(self):
        """Method to generate formio token using formio login API."""
        headers = {"Content-Type": "application/json"}
        url = f"{self.base_url}/user/login"
        payload = {
            "data": {
                "email": current_app.config.get("FORMIO_USERNAME"),
                "password": current_app.config.get("FORMIO_PASSWORD"),
            }
        }
        current_app.logger.info("Generate formio token using formio login API.")
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            if response.ok:
                form_io_token = response.headers["x-jwt-token"]
                return form_io_token
            else:
                raise BusinessException(ExternalError.ERROR_RESPONSE_RECEIVED, detail_message=response.json())
        except requests.ConnectionError:
            raise BusinessException(ExternalError.FORM_SERVICE_UNAVAILABLE)

    def create_form(self, data, formio_token):
        """Post request to formio API to create form."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form"
        return self._invoke_service(url, headers, data=data)

    @staticmethod
    def _invoke_service(url, headers, data=None, method: str = 'POST', raise_for_error: bool = True):
        """Invoke formio service and handle error."""
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, data=json.dumps(data))
            elif method == 'PUT':
                response = requests.put(url, headers=headers, data=json.dumps(data))
            elif method == 'PATCH':
                response = requests.patch(url, headers=headers, data=json.dumps(data))
            if raise_for_error:
                if response.ok:
                    return response.json()
                else:
                    raise BusinessException(ExternalError.ERROR_RESPONSE_RECEIVED, detail_message=response.json())
            else:
                return response.json()
        except requests.ConnectionError:
            raise BusinessException(ExternalError.FORM_SERVICE_UNAVAILABLE)

    def update_form(self, form_id, data, formio_token):
        """Put request to formio API to update form."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form/{form_id}"
        return self._invoke_service(url, headers, data=data, method='PUT')

    def get_role_ids(self):
        """Get request to Formio API to retrieve role ids."""
        url = f"{self.base_url}/role"
        headers = {"x-jwt-token": self.get_formio_access_token()}
        current_app.logger.info("Role id fetching started...")
        return self._invoke_service(url, headers, method='GET')

    def get_user_resource_ids(self):
        """Get request to Formio API to retrieve user resource ids."""
        url = f"{self.base_url}/user"
        current_app.logger.info("Fetching user resource ids...")
        return self._invoke_service(url, headers={}, method='GET')

    def get_form(self, data, formio_token):
        """Get request to formio API to get form details."""
        return self.get_form_by_id(data["form_id"], formio_token)

    def get_form_by_id(self, form_id: str, formio_token):
        """Get request to formio API to get form details."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form/{form_id}"
        return self._invoke_service(url, headers, method='GET')

    def get_submission(self, data, formio_token):
        """Get request to formio API to get submission details."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = (
                f"{self.base_url}/form/" + data["form_id"] + "/submission/" + data["sub_id"]
        )
        return self._invoke_service(url, headers, method='GET')

    def post_submission(self, data, formio_token):
        """Post request to formio API to create submission details."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = (
            f"{self.base_url}/form/{data['formId']}/submission"
        )
        return self._invoke_service(url, headers, data=data)

    def patch_submission(self, form_id, submission_id, data, formio_token, raise_for_error: bool = True):
        """Patch form submission data with the payload."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = (
            f"{self.base_url}/form/{form_id}/submission/{submission_id}"
        )
        return self._invoke_service(url, headers, data=data, method='PATCH', raise_for_error=raise_for_error)

    def get_form_by_path(self, path_name: str, formio_token: str) -> dict:
        """Get request to formio API to get form details from path."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/{path_name}"
        return self._invoke_service(url, headers, method='GET')

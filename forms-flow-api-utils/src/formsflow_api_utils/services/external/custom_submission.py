import requests
from flask import current_app

from formsflow_api_utils.exceptions import BusinessException, ExternalError
from formsflow_api_utils.utils import HTTP_TIMEOUT
from typing import Any

class CustomSubmissionService:
    
    def __init__(self) -> None:
        self.base_url = current_app.config.get("CUSTOM_SUBMISSION_URL")
    
    def __get_headers(self, token: str) -> dict:
        """Returns the headers for the request."""
        return {"Authorization": token, "Content-Type": "application/json"}

    def fetch_submission_data(self, token: str, form_id: str, submission_id: str) -> Any:
        """Returns the submission data from the form adapter."""
        if not self.base_url:
            raise BusinessException("Base URL for custom submission is not configured.")
        
        submission_url = f"{self.base_url}/form/{form_id}/submission/{submission_id}"
        current_app.logger.debug(f"Fetching custom submission data: {submission_url}")
        headers = self.__get_headers(token)
        
        try:
            response = requests.get(submission_url, headers=headers, timeout=HTTP_TIMEOUT)
            current_app.logger.debug(f"Custom submission response code: {response.status_code}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error fetching custom submission data: {str(e)}")
            raise ExternalError("Failed to fetch custom submission data.") from e

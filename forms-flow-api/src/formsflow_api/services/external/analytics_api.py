"""This exposes the analytics API."""

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException, ExternalError
from formsflow_api_utils.utils import HTTP_TIMEOUT, UserContext, user_context

from formsflow_api.constants import BusinessErrorCode


class RedashAPIService:  # pylint: disable=too-few-public-methods
    """This class manages all the Redash analytics service API calls."""

    @staticmethod
    @user_context
    def get_request(url_path, page_no=None, limit=None, **kwargs):
        """This method makes the GET request to Redash API."""
        user: UserContext = kwargs["user"]
        base_url = f"{current_app.config.get('ANALYTICS_API_URL')}"
        if tenant_key := user.tenant_key:
            base_url = f"{base_url}/{tenant_key}"
        if page_no is None:
            url = f"{base_url}/api/{url_path}"
        else:
            url = f"{base_url}/api/{url_path}?page={page_no}&page_size={limit}"
        current_app.logger.debug("URL for getting dashboard  %s", url)
        analytics_admin_token = current_app.config.get("ANALYTICS_API_KEY")
        headers = {"Authorization": analytics_admin_token}
        try:
            response = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT)
            current_app.logger.debug("Response from analytics  %s", response)
            current_app.logger.debug("Response from analytics  %s", response.json())
            if response.ok:
                return response.json()
            if response.status_code == 404:
                raise BusinessException(BusinessErrorCode.INSIGHTS_NOTFOUND)
            raise BusinessException(BusinessErrorCode.INVALID_INSIGHTS_RESPONSE)
        except requests.ConnectionError as e:
            raise BusinessException(ExternalError.INSIGHTS_SERVICE_UNAVAILABLE) from e

"""This exposes the analytics API."""
from http import HTTPStatus

import requests
from flask import current_app
from formsflow_api_utils.utils.user_context import UserContext, user_context


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
        response = requests.get(url, headers=headers)
        current_app.logger.debug("Response from analytics  %s", response)
        current_app.logger.debug("Response from analytics  %s", response.json())
        if response.ok:
            return response.json()
        if response.status_code == HTTPStatus.NOT_FOUND:
            return "unauthorized"
        return None

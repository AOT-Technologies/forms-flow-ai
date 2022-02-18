"""This exposes the analytics API"""
from http import HTTPStatus

import requests
from flask import current_app


class RedashAPIService:  # pylint: disable=too-few-public-methods
    """This class manages all the Redash analytics service API calls"""

    @staticmethod
    def get_request(url_path, page_no=None, limit=None):
        """This method makes the GET request to Redash API"""
        if page_no is None:
            url = f"{current_app.config.get('ANALYTICS_API_URL')}/api/{url_path}"
        else:
            url = f"{current_app.config.get('ANALYTICS_API_URL')}/api/{url_path}?page={page_no}&page_size={limit}"
        analytics_admin_token = current_app.config.get("ANALYTICS_API_KEY")
        headers = {"Authorization": analytics_admin_token}
        response = requests.get(url, headers=headers)

        if response.ok:
            return response.json()
        if response.status_code == HTTPStatus.NOT_FOUND:
            return "unauthorized"
        return None

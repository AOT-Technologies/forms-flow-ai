"""This exposes the analytics API"""
import requests
from flask import current_app


class RedashAPIService:
    """This class manages all the Redash analytics service API calls"""
    def get_request(self, url_path):
        url = f"{current_app.config.get('ANALYTICS_API_URL')}/api/{url_path}"
        analytics_admin_token = current_app.config.get("ANALYTICS_API_KEY")
        headers = {"Authorization": analytics_admin_token}
        response = requests.get(url, headers=headers)

        if response.ok:
            return response.json()
        else:
            return None

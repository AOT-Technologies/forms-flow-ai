"""This exports all of the base externel service used by the application."""
import json

import requests
from flask import current_app


class BaseService():
    """This class manages all of the base externel service calls."""

    @staticmethod
    def get_request(url,headers):
        """Get HTTP request to External API."""  
        r = requests.get(url, headers=headers)
        return r

    @staticmethod
    def post_request(url,headers):
        """Post HTTP request to External API."""
        r = requests.post(url, headers=headers)
        return r


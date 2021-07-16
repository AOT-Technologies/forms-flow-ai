"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restx namespaces to mount individual api endpoints into the service.
"""

from flask import url_for, current_app
from flask_jwt_oidc import AuthError
from flask_restx import Api

from .sentiment_analysis import API as SENTIMENT_API
from ..exceptions import BusinessException


class CustomApi(Api):
    @property
    def specs_url(self):
        """Monkey patch for HTTPS"""
        self_api_base = current_app.config.get('WEB_API_BASE_URL')
        return url_for(self.endpoint('specs'), _external=True, _scheme=self_api_base.partition(':')[0])


# This will add the Authorize button to the swagger docs
# oauth2 & openid may not yet be supported by restplus
AUTHORIZATIONS = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    }
}

API = CustomApi(
    title='formsflow.ai API',
    version='1.0',
    description='The API for formsflow.ai. Checkout: formsflow.ai to know more',
    security=['apikey'],
    authorizations=AUTHORIZATIONS, doc='/swagger/')


@API.errorhandler(BusinessException)
def handle_business_exception(error: BusinessException):
    """Handle Business exception."""
    return {'message': error.error}, error.status_code, {'Access-Control-Allow-Origin': '*'}


@API.errorhandler(AuthError)
def handle_auth_error(error: AuthError):
    """Handle Business exception."""
    return {'message': 'Access Denied'}, error.status_code, {'Access-Control-Allow-Origin': '*'}


API.add_namespace(SENTIMENT_API, path='/sentiment')

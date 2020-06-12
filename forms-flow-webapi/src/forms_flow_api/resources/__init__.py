"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restx namespaces to mount individual api endpoints into the service.
"""

from flask_jwt_oidc import AuthError
from flask_restx import Api

from ..exceptions import BusinessException
from .application import API as APPLICATION_API
from .submission import API as SUBMISSION_API
from .formiotoken import API as FORMIOTOKEN_API
from .process import API as PROCESS_API
from .task import API as TASK_API
from .tenant import API as TENANT_API


# This will add the Authorize button to the swagger docs
# oauth2 & openid may not yet be supported by restplus
AUTHORIZATIONS = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    }
}

API = Api(
    title='FORMIO API',
    version='1.0',
    description='The API for FORMIO',
    security=['apikey'],
    authorizations=AUTHORIZATIONS)


@API.errorhandler(BusinessException)
def handle_business_exception(error: BusinessException):
    """Handle Business exception."""
    return {'message': error.error}, error.status_code, {'Access-Control-Allow-Origin': '*'}


@API.errorhandler(AuthError)
def handle_auth_error(error: AuthError):
    """Handle Business exception."""
    return {'message': 'Access Denied'}, error.status_code, {'Access-Control-Allow-Origin': '*'}


API.add_namespace(FORMIOTOKEN_API, path='/getformiotoken')
API.add_namespace(APPLICATION_API, path='/application')
API.add_namespace(SUBMISSION_API, path='/application')
API.add_namespace(PROCESS_API, path='/process')
API.add_namespace(TASK_API, path='/task')
API.add_namespace(TENANT_API, path='/tenant')

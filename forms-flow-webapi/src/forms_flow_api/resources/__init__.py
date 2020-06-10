"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restplus namespaces to mount individual api endpoints into the service.
"""

from flask_restx import Api

from .application import API as APPLICATION_API
from .submission import API as SUBMISSION_API
from .formiotoken import api as formiotoken
from .process import API as PROCESS_API
from .task import api as task
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

API.add_namespace(formiotoken, path='/getformiotoken')
API.add_namespace(APPLICATION_API, path='/application')
API.add_namespace(SUBMISSION_API, path='/submission')
API.add_namespace(PROCESS_API, path='/process')
API.add_namespace(task, path='/task')
API.add_namespace(TENANT_API, path='/tenant')

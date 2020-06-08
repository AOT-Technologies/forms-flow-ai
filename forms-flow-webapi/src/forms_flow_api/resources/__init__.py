"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restplus namespaces to mount individual api endpoints into the service.
"""

from flask_restplus import Api

from .application import api as application
from .application import createapi as createapplication
from .submission import submissionapi as submissions
from .submission import createsubmissionapi as submission
from .formiotoken import api as formiotoken
from .process import api as process
from .task import api as task

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
API.add_namespace(application, path='/application')
API.add_namespace(createapplication, path='/application')
API.add_namespace(submissions, path='/application')
API.add_namespace(submission, path='/application')
API.add_namespace(process, path='/process')
API.add_namespace(task, path='/task')

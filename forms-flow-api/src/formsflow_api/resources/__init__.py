"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restx namespaces to mount individual api endpoints into the service.
"""

from flask_jwt_oidc import AuthError
from flask_restx import Api
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.constants import ALLOW_ALL_ORIGINS

from formsflow_api.resources.anonymous_application import API as PUBLIC_API
from formsflow_api.resources.application import API as APPLICATION_API
from formsflow_api.resources.application_history import (
    API as APPLICATION_HISTORY_API,
)
from formsflow_api.resources.authorization import API as AUTHORIZATION_API
from formsflow_api.resources.checkpoint import API as CHECKPOINT_API
from formsflow_api.resources.dashboards import API as DASHBOARDS_API
from formsflow_api.resources.draft import API as DRAFT_API
from formsflow_api.resources.form_process_mapper import API as FORM_API
from formsflow_api.resources.formio import API as FORMIO_API
from formsflow_api.resources.groups import API as KEYCLOAK_GROUPS_API
from formsflow_api.resources.metrics import API as APPLICATION_METRICS_API
from formsflow_api.resources.process import API as PROCESS_API
from formsflow_api.resources.user import API as KEYCLOAK_USER_API

# This will add the Authorize button to the swagger docs
# oauth2 & openid may not yet be supported by restplus
AUTHORIZATIONS = {"apikey": {"type": "apiKey", "in": "header", "name": "Authorization"}}

API = Api(
    title="formsflow.ai API",
    version="1.0",
    description="The API for formsflow.ai. Checkout: formsflow.ai to know more",
    security=["apikey"],
    authorizations=AUTHORIZATIONS,
    doc="/",
)


@API.errorhandler(BusinessException)
def handle_business_exception(error: BusinessException):
    """Handle Business exception."""
    return (
        {"message": error.error},
        error.status_code,
        {"Access-Control-Allow-Origin": ALLOW_ALL_ORIGINS},
    )


@API.errorhandler(AuthError)
def handle_auth_error(error: AuthError):
    """Handle Auth exception."""
    return (
        {
            "type": "Invalid Token Error",
            "message": "Access to formsflow.ai API Denied. Check if the "
            "bearer token is passed for Authorization or has expired.",
        },
        error.status_code,
        {"Access-Control-Allow-Origin": ALLOW_ALL_ORIGINS},
    )


API.add_namespace(APPLICATION_API, path="/application")
API.add_namespace(APPLICATION_HISTORY_API, path="/application")
API.add_namespace(APPLICATION_METRICS_API, path="/metrics")
API.add_namespace(CHECKPOINT_API, path="/checkpoint")
API.add_namespace(DASHBOARDS_API, path="/dashboards")
API.add_namespace(FORM_API, path="/form")
API.add_namespace(KEYCLOAK_GROUPS_API, path="/groups")
API.add_namespace(PROCESS_API, path="/process")
API.add_namespace(PUBLIC_API, path="/public")
API.add_namespace(KEYCLOAK_USER_API, path="/user")
API.add_namespace(DRAFT_API, path="/draft")
API.add_namespace(FORMIO_API, path="/formio")
API.add_namespace(AUTHORIZATION_API, path="/authorizations")

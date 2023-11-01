"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restx namespaces to mount individual api endpoints into the service.
"""

from flask_restx import Api

from formsflow_documents.resources.checkpoint import API as CHECKPOINT_API
from formsflow_documents.resources.pdf import API as FORM_API

# This will add the Authorize button to the swagger docs
# oauth2 & openid may not yet be supported by restplus
AUTHORIZATIONS = {"apikey": {"type": "apiKey", "in": "header", "name": "Authorization"}}

API = Api(
    title="formsflow.ai documents API",
    version="1.0",
    description="The API for formsflow.ai to handle document realted services. Checkout: formsflow.ai to know more",
    security=["apikey"],
    authorizations=AUTHORIZATIONS,
    doc="/",
)

API.add_namespace(FORM_API, path="/form")
API.add_namespace(CHECKPOINT_API, path="/checkpoint")

"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restx namespaces to mount individual api endpoints into the service.
"""

from flask_restx import Api
from flask_jwt_oidc import AuthError
from .checkpoint import API as CHECKPOINT_API
from .sentiment_analysis import API as SENTIMENT_API

data_analysis_api = Api(
    version="1.0",
    title="Sentiment-API",
    description="API endpoint for sentiment analysis component for formsflow.ai.",
)


@data_analysis_api.errorhandler(AuthError)
def handle_auth_error(error: AuthError):
    """Handle Business exception."""
    return (
        {"message": "Access Denied"},
        error.status_code,
        {"Access-Control-Allow-Origin": "*"},
    )


data_analysis_api.add_namespace(CHECKPOINT_API, path="/checkpoint")
data_analysis_api.add_namespace(SENTIMENT_API, path="/sentiment")

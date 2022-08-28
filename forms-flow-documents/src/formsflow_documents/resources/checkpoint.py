"""API endpoints for managing healthcheckpoint API resource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import cors_preflight, profiletime

API = Namespace("Checkpoint", description="Checkpoint")


@cors_preflight("GET")
@API.route("", methods=["GET"])
class HealthCheckpointResource(Resource):
    """Resource for managing healthcheckpoint."""

    @staticmethod
    @profiletime
    def get():
        """Get the status of API."""
        return (
            ({"message": "Welcome to formsflow.ai documents API"}),
            HTTPStatus.OK,
        )

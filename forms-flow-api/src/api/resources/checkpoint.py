"""API endpoints for managing healthcheckpoint API resource."""

from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS


API = Namespace("Checkpoint", description="Checkpoint")


@cors_preflight("GET")
@API.route("", methods=["GET"])
class HealthCheckpointResource(Resource):
    """Resource for managing healthcheckpoint."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    def get():
        """Get the status of API."""
        return (
            jsonify({"message": "Welcome to formsflow.ai API"}),
            HTTPStatus.OK,
        )

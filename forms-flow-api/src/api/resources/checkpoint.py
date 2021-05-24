"""API endpoints for managing healthcheckpoint API resource."""

from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from ..utils.util import cors_preflight


API = Namespace("Checkpoint", description="Checkpoint")


@cors_preflight("GET")
@API.route("", methods=["GET"])
class HealthCheckpointResource(Resource):
    """Resource for managing healthcheckpoint."""

    @staticmethod
    @cors.crossdomain(origin="*")
    def get():
        """Get the status of API."""
        return (
            jsonify({"message": "Welcome to formsflow.ai API"}),
            HTTPStatus.OK,
        )

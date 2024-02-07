"""Dummy endpoints for ipaas."""

from http import HTTPStatus

from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

API = Namespace("Integration", description="iPaas related endpoints")


@cors_preflight("GET, OPTIONS")
@API.route("/embed/display", methods=["GET", "OPTIONS"])
class DisplayEmbed(Resource):
    """Resource to manage display settings for embed."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
    )
    def get():
        """Return false to get the web going with implementation."""
        return {"enabled": False}, HTTPStatus.OK

"""API endpoints for generating formio token."""

# from http import HTTPStatus

# from flask import jsonify
# from flask_restx import Namespace, Resource

# from ..services import FormIOTokenService
# from ..utils.util import cors_preflight


# API = Namespace("FormIOToken", description="FormIOToken")


# @cors_preflight("GET,OPTIONS")
# @API.route("", methods=["GET", "OPTIONS"])
# class ApplicationList(Resource):
#     """Resource for generatiing formiotoken."""

#     @staticmethod
#     def get():
#         """Get formio token."""
#         return (
#             jsonify({"formioToken": FormIOTokenService.get_formio_token()}),
#             HTTPStatus.OK,
#         )

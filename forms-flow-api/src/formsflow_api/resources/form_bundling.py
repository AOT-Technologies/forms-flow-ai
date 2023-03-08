"""API endpoints for form bundling."""

from http import HTTPStatus

from flask import current_app
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

from formsflow_api.services import FormBundlingService

API = Namespace("Form Bundles", description="APIs for form bundled")


@cors_preflight("GET, OPTIONS")
@API.route("/<int:bundle_id>/forms", methods=["GET", "OPTIONS"])
@API.doc(params={"bundle_id": "Forms inside a bundle by bundle_id"})
class BundleFormsById(Resource):
    """Resource for listing forms inside a bundle."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            403: "FORBIDDEN:- Permission denied",
        },
    )
    def get(bundle_id: int):
        """
        Get forms by bundle id.

        Get forms inside a bundle by bundle id.
        """
        try:
            response = FormBundlingService.get_forms_bundle(bundle_id)
            return response, HTTPStatus.OK
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error

"""API endpoints for managing formio resource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource
from formsflow_api.utils.user_context import UserContext, user_context
from formsflow_api.utils import get_role_ids_from_user_groups

from formsflow_api.utils import (
    auth,
    cache,
    cors_preflight,
    profiletime,
)

API = Namespace("Formio", description="formio")


@cors_preflight("GET, OPTIONS")
@API.route("/roles", methods=["GET", "OPTIONS"])
class FormioResource(Resource):
    """Resource for retrieving roles from Formio."""

    @staticmethod
    @auth.require
    @profiletime
    @user_context
    def get(**kwargs):
        """Get role ids from cache."""
        try:
            user: UserContext = kwargs["user"]
            user_role = user.token_info["role"]
            role_ids = cache.get("formio_role_ids")
            result = get_role_ids_from_user_groups(role_ids, user_role)

            if result is not None:
                return (result, HTTPStatus.OK)

            return (
                {"message": "Role ids not available on server"},
                HTTPStatus.NOT_FOUND,
            )

        except Exception as err:
            raise err

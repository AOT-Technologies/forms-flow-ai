"""API endpoints for managing formio resource."""

from http import HTTPStatus

from flask import current_app
from flask_restx import Namespace, Resource

from formsflow_api_utils.utils import (
    auth,
    cache,
    cors_preflight,
    get_role_ids_from_user_groups,
    profiletime,
)
from formsflow_api_utils.utils.user_context import UserContext, user_context

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
            assert user.token_info is not None
            user_role = user.token_info["role"]
            role_ids = cache.get("formio_role_ids")
            roles = get_role_ids_from_user_groups(role_ids, user_role)
            if roles is not None:
                result = {"roles": roles, "resource_id": cache.get("user_resource_id")}
                return (result, HTTPStatus.OK)

            return (
                {"message": "Role ids not available on server"},
                HTTPStatus.SERVICE_UNAVAILABLE,
            )
        except ValueError as err:
            current_app.logger.warning(err)
            return (
                {"message": "Role ids not available on server"},
                HTTPStatus.SERVICE_UNAVAILABLE,
            )

        except Exception as err:
            raise err

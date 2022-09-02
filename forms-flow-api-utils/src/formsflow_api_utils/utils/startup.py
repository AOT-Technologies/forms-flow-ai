"""
App initialization.
Functions to initialize app and startup

"""
from typing import Dict
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.schemas import FormioRoleSchema
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils import cache
from formsflow_api_utils.utils.enums import FormioRoles


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""

    def get_roles(a_dict):
        resource = a_dict["resource_access"].get(app.config["JWT_OIDC_AUDIENCE"])
        return resource["roles"] if resource else a_dict["roles"]

    app.config["JWT_ROLE_CALLBACK"] = get_roles
    jwt_manager.init_app(app)


def collect_role_ids(app):
    """Collect role ids from Form.io."""
    try:
        service = FormioService()
        app.logger.info("Establishing new connection to formio...")
        role_ids = FormioRoleSchema().load(service.get_role_ids(), many=True)
        role_ids_filtered = list(filter(None, map(standardization_fn, role_ids)))
        # Cache will be having infinite expiry
        if role_ids:
            cache.set(
                "formio_role_ids",
                role_ids_filtered,
                timeout=0,
            )
            app.logger.info("Role ids saved to cache successfully.")
    except BusinessException as err:
        app.logger.error(err.error)
    except Exception as err:  # pylint: disable=broad-except
        app.logger.error(err)


def collect_user_resource_ids(app):
    """Collects user resource ids from Form.io."""
    try:
        service = FormioService()
        user_resource = service.get_user_resource_ids()
        user_resource_id = user_resource["_id"]
        if user_resource:
            cache.set(
                "user_resource_id",
                user_resource_id,
                timeout=0,
            )
            app.logger.info("User resource ids saved to cache successfully.")
    except Exception as err:  # pylint: disable=broad-except
        app.logger.error(err)


def standardization_fn(item: Dict) -> Dict or None:
    """Updates the type value to enum key for standardization."""
    if FormioRoles.contains(item["type"]):
        item["type"] = FormioRoles(item["type"]).name
        return item
    return None

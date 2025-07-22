from typing import Any, List, Union

import strawberry
from starlette.requests import Request
from starlette.websockets import WebSocket
from strawberry.permission import BasePermission, PermissionExtension

from graphql import GraphQLError
from src.config.envs import ENVS
from src.utils import KeycloakOIDC, UserContext, get_logger

logger = get_logger("middlewares.auth")
keycloak_validator = KeycloakOIDC(
    jwks_url=ENVS.JWT_OIDC_JWKS_URI,
    issuer=ENVS.JWT_OIDC_ISSUER,
    audience=ENVS.JWT_OIDC_AUDIENCE,
)


class IsAuthenticated(BasePermission):
    """Checking user authentication."""

    message = "User is not authenticated"
    error_extensions = {"code": "UNAUTHORIZED"}

    async def has_permission(
        self, source: Any, info: strawberry.Info, **kwargs
    ) -> bool:
        """Has permission is default function to check the permission."""
        try:
            logger.info("Fetching token from Header")
            request: Union[Request, WebSocket] = info.context["request"]
            auth = request.headers.get("Authorization")
            if not auth or not auth.startswith("Bearer "):
                return False
            token = auth.split(" ")[1]
            payload = await keycloak_validator.verify_token(token)
            # Attach token info to context
            info.context["user"] = UserContext(token=token, token_info=payload)
            return True
        except Exception as e:
            logger.error(e)
            raise GraphQLError(f"Unexpected error: {str(e)}")


class IsAdmin(BasePermission):
    """Class for check if user is admin."""

    message = "User role must be admin"
    error_extensions = {"code": "UNAUTHORIZED"}

    async def has_permission(
        self, source: Any, info: strawberry.Info, **kwargs
    ) -> bool:
        try:
            user = info.context["user"]
            return user.has_any_roles(['admin'])
        except Exception as e:
            raise GraphQLError(f"Unexpected error: {str(e)}")


class HasAnyRole(BasePermission):
    """Class for check authorization."""

    message = "User role not exist"
    error_extensions = {"code": "UNAUTHORIZED"}

    def __init__(self, roles: List):
        self.roles = roles

    async def has_permission(
        self, source: Any, info: strawberry.Info, **kwargs
    ) -> bool:
        try:
            user = info.context["user"]
            return user.has_any_roles(self.roles)
        except Exception as e:
            raise GraphQLError(f"Unexpected error: {str(e)}")


class Auth:
    @staticmethod
    def auth_required(roles: List[str] = None):
        """
        Creates a permission chain with IsAuthenticated and optional role checking

        Args:
            roles: Optional list of roles to check

        Returns:
            PermissionExtension
        """
        permissions = [IsAuthenticated()]
        if roles:
            permissions.append(HasAnyRole(roles))
        return PermissionExtension(permissions=permissions)


auth = Auth()

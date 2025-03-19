from typing import List

from src.config.envs import ENVS


class UserContext:  # pylint: disable=too-many-instance-attributes
    """Object to hold request scoped user context."""

    def __init__(self, token, token_info):
        """Initialize User Context object."""
        self._tenant_key = token_info.get("tenantKey", None)
        self._user_name = token_info.get("preferred_username", None)
        self._bearer_token: str = token
        self.token_info = token_info
        self._email = token_info.get("email")
        self._roles: list = token_info.get("roles", None) or token_info.get(
            "role", None
        )
        self._groups: list = token_info.get("groups", None)

    def _get_attr(self, attr_name: str):
        """Generic attribute getter."""
        return getattr(self, attr_name)

    @property
    def tenant_key(self) -> str:
        return self._get_attr("_tenant_key")

    @property
    def user_name(self) -> str:
        return self._get_attr("_user_name")

    @property
    def bearer_token(self) -> str:
        return self._get_attr("_bearer_token")

    @property
    def email(self) -> str:
        return self._get_attr("_email")

    @property
    def roles(self) -> List[str]:
        return self._get_attr("_roles")

    @property
    def groups(self) -> List[str]:
        return self._get_attr("_groups")

    @property
    def group_or_roles(self) -> List[str]:
        """Return groups if env is using groups, else roles."""
        if ENVS.get("KEYCLOAK_ENABLE_CLIENT_AUTH") and not ENVS.get(
            "MULTI_TENANCY_ENABLED"
        ):
            return self.roles
        return self.groups

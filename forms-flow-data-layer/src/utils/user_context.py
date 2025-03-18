from typing import List

from src.config.envs import ENVS


class UserContext:  # pylint: disable=too-many-instance-attributes
    """Object to hold request scoped user context."""

    def __init__(self, token, token_info):
        """Return a User Context object."""
        self._tenant_key = token_info.get("tenantKey", None)
        self._user_name = token_info.get("preferred_username", None)
        self._bearer_token: str = token
        self.token_info = token_info
        self._email = token_info.get("email")
        self._roles: list = token_info.get("roles", None) or token_info.get(
            "role", None
        )
        self._groups: list = token_info.get("groups", None)

    @property
    def tenant_key(self) -> str:
        """Return the tenant key."""
        return self._tenant_key

    @property
    def user_name(self) -> str:
        """Return the user name."""
        return self._user_name

    @property
    def bearer_token(self) -> str:
        """Return the bearer_token."""
        return self._bearer_token

    @property
    def email(self) -> str:
        """Return the email."""
        return self._email

    @property
    def roles(self) -> List[str]:
        """Return the roles."""
        return self._roles

    @property
    def groups(self) -> List[str]:
        """Return the roles."""
        return self._groups

    @property
    def group_or_roles(self) -> List[str]:
        """Return groups is env is using groups, else roles."""
        if ENVS.get("KEYCLOAK_ENABLE_CLIENT_AUTH") and not ENVS.get(
            "MULTI_TENANCY_ENABLED"
        ):
            return self._roles
        return self._groups

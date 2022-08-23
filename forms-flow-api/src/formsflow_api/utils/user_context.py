"""User Context to hold request scoped variables."""

import functools
from typing import Dict, List

from flask import current_app, g, request


def _get_context():
    """Return User context."""
    return UserContext()


class UserContext:  # pylint: disable=too-many-instance-attributes
    """Object to hold request scoped user context."""

    def __init__(self):
        """Return a User Context object."""
        token_info: Dict = _get_token_info()
        self._tenant_key = token_info.get("tenantKey", None)
        self._user_name = token_info.get("preferred_username", None)
        self._bearer_token: str = _get_token()
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
    def group_or_roles(self) -> List[str]:
        """Return groups is env is using groups, else roles."""
        return (
            self._roles
            if current_app.config.get("KEYCLOAK_ENABLE_CLIENT_AUTH")
            else self._groups
        )


def user_context(function):
    """Add user context object as an argument to function."""

    @functools.wraps(function)
    def wrapper(*func_args, **func_kwargs):
        context = _get_context()
        func_kwargs["user"] = context
        return function(*func_args, **func_kwargs)

    return wrapper


def _get_token_info() -> Dict:
    return g.jwt_oidc_token_info if g and "jwt_oidc_token_info" in g else {}


def _get_token() -> str:
    token: str = (
        request.headers["Authorization"]
        if request and "Authorization" in request.headers
        else None
    )
    return token

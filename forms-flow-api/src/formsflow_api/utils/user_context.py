"""User Context to hold request scoped variables."""

import functools
from typing import Dict

from flask import g


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

    @property
    def tenant_key(self) -> str:
        """Return the tenant key."""
        return self._tenant_key

    @property
    def user_name(self) -> str:
        """Return the user name."""
        return self._user_name


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

from typing import Any, Callable, List

import strawberry
from strawberry.extensions import FieldExtension


class RoleCheck(FieldExtension):
    """Custom extension."""

    def __init__(self, roles: List):
        self.roles = roles

    def resolve(
        self, next: Callable[..., Any], source: Any, info: strawberry.Info, **kwargs
    ):
        """Resolver for sync process."""
        user = info.context["user"]
        result = next(source, info, **kwargs)
        if user.has_any_roles(self.roles):
            return str(result)
        return None

    async def resolve_async(
        self, next: Callable[..., Any], source: Any, info: strawberry.Info, **kwargs
    ):
        """Resolve_async for async process"""
        user = info.context["user"]
        result = await next(source, info, **kwargs)
        if user.has_any_roles(self.roles):
            return str(result)
        return None

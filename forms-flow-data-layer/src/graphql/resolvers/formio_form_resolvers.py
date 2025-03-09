from typing import List, Optional

import strawberry

from src.graphql.schema import FormSchema
from src.graphql.service import FormService
from src.utils import cache_graphql


# GraphQL Resolver
@strawberry.type
class FormResolver:
    @strawberry.field
    @cache_graphql(expire=120, key_prefix="forms")
    async def forms(
        self, skip: int = 0, limit: int = 100, type_filter: Optional[str] = None
    ) -> List[FormSchema]:
        """
        GraphQL resolver for fetching forms

        Args:
            skip (int): Pagination - number of items to skip
            limit (int): Maximum number of items to return
            type_filter (Optional[str]): Optional filter by form type

        Returns:
            List[FormSchema]: List of forms
        """
        return await FormService.get_forms(
            skip=skip, limit=limit, type_filter=type_filter
        )

    @strawberry.field
    async def form_by_id(self, form_id: str) -> Optional[FormSchema]:
        """resolver to fetch a single form by id"""
        return await FormService.get_form(form_id=form_id)

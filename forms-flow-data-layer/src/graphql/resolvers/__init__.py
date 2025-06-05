import strawberry

from src.graphql.resolvers.submission_resolvers import (
    QuerySubmissionsResolver,
)


@strawberry.type
class Query(QuerySubmissionsResolver):  # Inherit from query classes
    pass

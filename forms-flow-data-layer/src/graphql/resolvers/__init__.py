import strawberry

from src.graphql.resolvers.form_resolvers import QueryFormsResolver
from src.graphql.resolvers.submission_resolvers import QuerySubmissionsResolver


@strawberry.type
class Query(QuerySubmissionsResolver, QueryFormsResolver):  # Inherit from query classes
    pass

import strawberry

from src.graphql.resolvers.form_resolvers import QueryFormsResolver
from src.graphql.resolvers.metric_resolvers import QueryMetricResolver
from src.graphql.resolvers.submission_resolvers import QuerySubmissionsResolver


@strawberry.type
class Query(QuerySubmissionsResolver, QueryMetricResolver, QueryFormsResolver):  # Inherit from query classes
    pass

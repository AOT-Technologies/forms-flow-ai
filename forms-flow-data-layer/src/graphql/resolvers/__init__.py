import strawberry

from src.graphql.resolvers.formio_form_resolvers import FormResolver
from src.graphql.resolvers.submission_resolvers import (
    QuerySubmissionsResolver,
    SubmissionResolver,
)


@strawberry.type
class Query(
    FormResolver, SubmissionResolver, QuerySubmissionsResolver
):  # Inherit from query classes
    pass

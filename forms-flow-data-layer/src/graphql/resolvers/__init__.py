import strawberry

from src.graphql.resolvers.formio_form_resolvers import FormResolver
from src.graphql.resolvers.submission_resolvers import SubmissionResolver


@strawberry.type
class Query(FormResolver, SubmissionResolver):  # Inherit from both query classes
    pass

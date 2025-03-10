import strawberry

from src.graphql.resolvers.formio_form_resolvers import FormResolver


@strawberry.type
class Query(FormResolver):  # Inherit from both query classes
    pass

import strawberry


@strawberry.type
class MetricSchema:
    """
    GraphQL type representing a Metric
    This is the external representation of your database model
    """

    metric: str
    count: int

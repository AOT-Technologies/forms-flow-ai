import strawberry
from strawberry.fastapi import GraphQLRouter

from src.graphql.resolvers import Query

all_queries = strawberry.Schema(query=Query)
grphql_app = GraphQLRouter(schema=all_queries)

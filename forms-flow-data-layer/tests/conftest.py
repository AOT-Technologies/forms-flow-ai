import asyncio
import os
import sys
from unittest.mock import patch

import httpx
import pytest
import strawberry
from starlette.requests import Request

from src.config.envs import ENVS
from src.graphql.resolvers import Query

from .utils import KeycloakTestTokenGenerator

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)


def pytest_configure(config):
    """
    Configure pytest asyncio mode to 'auto'.
    """
    config.option.asyncio_mode = "auto"


@pytest.fixture(scope="session", autouse=True)
def event_loop():
    """Create an event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


@pytest.fixture
def schema_tester():
    """Fixture to execute GraphQL queries directly on the schema."""
    schema = strawberry.Schema(query=Query)

    async def execute_query(query: str, variables=None, headers=None):
        """Execute GraphQL queries directly on the schema with a simulated request."""
        request = Request(scope={"type": "http", "headers": [(b"authorization", headers.get("Authorization", "").encode())]})
        context = {"request": request}
        return await schema.execute(query, variable_values=variables, context_value=context)

    return execute_query  # ✅ Returns the callable function


@pytest.fixture
def token_generator():
    return KeycloakTestTokenGenerator(
        issuer=ENVS.JWT_OIDC_ISSUER,
        audience="forms-flow-web"
    )


@pytest.fixture
def mock_jwks(token_generator):
    """Fixture to automatically mock JWKS endpoint for all tests"""
    test_jwks = token_generator.get_test_jwks()

    async def mock_jwks_response(*args, **kwargs):
        # Create a proper mock response with all needed attributes
        response = httpx.Response(
            status_code=200,
            json=test_jwks,
            request=httpx.Request("GET", ENVS.JWT_OIDC_JWKS_URI)
        )
        return response

    with patch.object(httpx.AsyncClient, 'get', new=mock_jwks_response):
        yield

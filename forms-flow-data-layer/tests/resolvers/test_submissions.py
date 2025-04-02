from dataclasses import dataclass
from unittest.mock import AsyncMock, patch

import pytest

from src.graphql.service import SubmissionService


@dataclass
class MockSubmission:
    """A dataclass representing a mock submission."""

    id: int
    application_status: str
    task_name: str
    data: dict


@pytest.mark.asyncio
async def test_submissions_query(schema_tester, token_generator, mock_jwks):
    """
    Test the GraphQL submissions query with mocked authentication and data.

    This test verifies that:
    1. The submissions query returns properly formatted data
    2. Authentication works correctly with a valid JWT token
    3. The response matches the expected structure and values

    Args:
        schema_tester: Pytest fixture for testing GraphQL queries
        token_generator: Fixture that creates valid JWT test tokens
        mock_jwks: Fixture that mocks the JWKS endpoint responses
    """

    dummy_token = token_generator.generate_test_token(subject="test-user")
    # Create mock response with dataclass objects
    mock_response = [
        MockSubmission(
            id=1,
            application_status="Pending",
            task_name="Review Application",
            data={"name": "John Doe", "age": 30}
        ),
        MockSubmission(
            id=2,
            application_status="Approved",
            task_name="Review Application",
            data={"name": "Jane Smith", "age": 25}
        )
    ]

    # Patch the get_submissions method with mock data
    with (
        patch.object(SubmissionService, "get_submissions", new=AsyncMock(return_value=mock_response))
    ):

        response = await schema_tester(
            """
            query {
                submissions(taskName: "Review Application", limit: 5) {
                    applicationStatus
                    taskName
                    data
                }
            }
            """, headers={"Authorization": f"Bearer {dummy_token}"}
        )

    # Assertions
    assert response.errors is None
    assert response.data["submissions"] == [
        {
            "applicationStatus": "Pending",
            "taskName": "Review Application",
            "data": {"name": "John Doe", "age": 30}
        },
        {
            "applicationStatus": "Approved",
            "taskName": "Review Application",
            "data": {"name": "Jane Smith", "age": 25}
        },
    ]

from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from src.graphql.service import SubmissionService


@pytest.mark.asyncio
async def test_submissions_query(schema_tester, token_generator, mock_jwks):
    """Test the submissions query with mocked data and authentication."""

    dummy_token = token_generator.generate_test_token(subject="test-user")
    # Mock response as objects instead of dictionaries
    mock_response = [
        SimpleNamespace(
            id=1,
            application_status="Pending",
            task_name="Review Application",
            data={"name": "John Doe", "age": 30},
        ),
        SimpleNamespace(
            id=2,
            application_status="Approved",
            task_name="Review Application",
            data={"name": "Jane Smith", "age": 25},
        ),
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
            """, headers={"Authorization": f"Bearer {dummy_token}"}  # ✅ Proper JWT format
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

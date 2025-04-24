from dataclasses import dataclass
from unittest.mock import AsyncMock, patch

import pytest

from src.graphql.schema import (
    PaginatedSubmissionResponse,
    SubmissionDetailsWithSubmissionData,
)
from src.graphql.service import SubmissionService


@dataclass
class MockSubmission:
    """A dataclass representing a mock submission."""

    id: int
    application_status: str
    task_name: str
    data: dict


@pytest.mark.asyncio
async def test_get_submissions(schema_tester, token_generator, mock_jwks):
    """Test querying submissions with mocked authentication and service response.

    This test verifies that:
    1. The GraphQL query for submissions works correctly with authentication
    2. The response structure matches the expected schema
    3. Pagination parameters are properly handled
    4. The service response is correctly transformed into the GraphQL response

    The test mocks:
    - Authentication using a generated JWT token with "reviewer" subject
    - The SubmissionService.query_submissions() method to return a predefined response

    Assertions verify:
    - No errors in the GraphQL response
    - Correct pagination metadata (totalCount, pageNo, limit)
    - Correct submission data
    """
    # Generate test token
    dummy_token = token_generator.generate_test_token(subject="reviewer")

    # Create mock response
    mock_service_response = PaginatedSubmissionResponse(
        submissions=[
            SubmissionDetailsWithSubmissionData(
                id=18,
                created_by="test-user1",
                application_status="Completed",
                data={"name": "user1", "location": "mumbai"},
            ),
            SubmissionDetailsWithSubmissionData(
                id=20,
                created_by="test-user1",
                application_status="Completed",
                data={"name": "user2", "location": "delhi"},
            ),
        ],
        total_count=2,
        page_no=1,
        limit=5,
    )

    # Mock the service method
    with patch.object(
        SubmissionService,
        "get_submissions",
        new=AsyncMock(return_value=mock_service_response),
    ):
        response = await schema_tester(
            """
            query {
                getSubmissions(
                    limit: 5
                    sortOrder: "desc"
                    sortBy: "location"
                    pageNo: 1
                    selectedFormFields: ["name", "location"]
                    parentFormId: "67eced6a11e3ea332946080e"
                    filters: {created_by: "test-user1"}
                ) {
                    totalCount
                    pageNo
                    submissions {
                        id
                        createdBy
                        applicationStatus
                        data
                    }
                    limit
                }
            }
            """,
            headers={"Authorization": f"Bearer {dummy_token}"},
        )

    # Assertions
    assert response.errors is None
    assert response.data["querysubmissions"]["totalCount"] == 2
    assert response.data["querysubmissions"]["pageNo"] == 1
    assert response.data["querysubmissions"]["limit"] == 5

    submissions = response.data["querysubmissions"]["submissions"]
    assert len(submissions) == 2
    assert submissions[0] == {
        "id": 18,
        "createdBy": "test-user1",
        "applicationStatus": "Completed",
        "data": {"name": "user1", "location": "mumbai"},
    }


@pytest.mark.asyncio
async def test_querysubmissions_without_form_selection(
    schema_tester, token_generator, mock_jwks
):
    """Test querying submissions without specifying parent_form_id parameter.

    Verifies that the submissions query works correctly when:
    - No parent_form_id is provided in the request
    - Basic filtering and sorting parameters are used
    - Only selected fields are requested in the response

    The test scenario:
    1. Generates an authenticated token for a reviewer
    2. Mocks the SubmissionService to return a predefined response

    Assertions validate:
    - No errors in the GraphQL response
    - Correct pagination metadata in the response
    - Proper sorting order (descending by ID)
    - Expected submission data structure
    - Correct number of returned submissions
    """
    # Generate test token
    dummy_token = token_generator.generate_test_token(subject="reviewer")

    # Create mock response
    mock_service_response = PaginatedSubmissionResponse(
        submissions=[
            SubmissionDetailsWithSubmissionData(
                id=20,
                created_by="test-user1",
                application_status="Completed",
            ),
            SubmissionDetailsWithSubmissionData(
                id=18,
                created_by="test-user1",
                application_status="Completed",
            ),
        ],
        total_count=2,
        page_no=1,
        limit=5,
    )

    # Mock the service method
    with patch.object(
        SubmissionService,
        "query_submissions",
        new=AsyncMock(return_value=mock_service_response),
    ):
        response = await schema_tester(
            """
            query {
                getSubmissions(
                    limit: 5
                    sortOrder: "desc"
                    sortBy: "id"
                    pageNo: 1
                    filter: {created_by: "test-user1"}
                ) {
                    totalCount
                    pageNo
                    submissions {
                        id
                        createdBy
                        applicationStatus
                    }
                    limit
                }
            }
            """,
            headers={"Authorization": f"Bearer {dummy_token}"},
        )

    # Assertions
    assert response.errors is None
    assert response.data["querysubmissions"]["totalCount"] == 2
    assert response.data["querysubmissions"]["pageNo"] == 1
    assert response.data["querysubmissions"]["limit"] == 5

    submissions = response.data["querysubmissions"]["submissions"]
    assert len(submissions) == 2
    assert submissions[0] == {
        "id": 20,
        "createdBy": "test-user1",
        "applicationStatus": "Completed",
    }


@pytest.mark.asyncio
async def test_querysubmissions_no_auth(schema_tester):
    """Test that proper error is returned when no token is provided"""
    response = await schema_tester(
        """
        query {
           getSubmissions(
                    limit: 5
                    sortOrder: "desc"
                    sortBy: "location"
                    pageNo: 1
                ) {
                    totalCount
                    pageNo
                    submissions {
                        id
                        createdBy
                        applicationStatus
                    }
                    limit
                }
        }
        """,
        headers={},  # No authorization header
    )

    assert response.data is None
    assert response.errors[0].message == "User is not authenticated"
    assert response.errors[0].path == ["querysubmissions"]
    assert response.errors[0].extensions["code"] == "UNAUTHORIZED"

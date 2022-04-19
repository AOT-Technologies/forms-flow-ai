"""Test suite for keycloak user API endpoint."""

# from tests import skip_in_ci
from tests.utilities.base_test import (
    factory_auth_header,
    get_locale_update_valid_payload,
)


class TestKeycloakUserServiceResource:
    """Test suite for the keycloak user service APIs."""

    # @skip_in_ci
    def test_successful_user_locale_update(self, app, client, session):
        """Assert that API /user when passed with valid payload returns 200 status code."""
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/locale", headers=headers, json=get_locale_update_valid_payload()
        )
        assert rv.status_code == 200

    def test_unsuccessful_user_locale_update(self, app, client, session):
        """Assert that API/user when passed with invalid payload return 400 status code."""
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put("/user/locale", headers=headers, json={})
        assert rv.status_code == 400
        assert rv.json == {
            "type": "Invalid Request Object format",
            "message": "Required fields are not passed",
        }

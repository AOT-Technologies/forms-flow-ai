"""Tests to assure the CORS utilities.

Test-Suite to ensure that the CORS decorator is working as expected.
"""

import pytest
from formsflow_api_utils.utils.util import cors_preflight

TEST_CORS_METHODS_DATA = [
    ("GET"),
    ("PUT"),
    ("POST"),
    ("GET,PUT"),
    ("GET,POST"),
    ("PUT,POST"),
    ("GET,PUT,POST"),
]


@pytest.mark.parametrize("methods", TEST_CORS_METHODS_DATA)
def test_cors_preflight_post(methods):
    """Assert that the options methos is added to the class and \
    that the correct access controls are set."""

    @cors_preflight(methods)
    class TestCors:
        pass

    rv = TestCors().options()

    assert rv[2]["Access-Control-Allow-Origin"] == "*"
    assert rv[2]["Access-Control-Allow-Methods"] == methods

"""Common setup and fixtures for the py-test suite used by this service."""

import pytest

from sentiment_analysis import create_app


@pytest.fixture(scope="session")
def app():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture(scope="function")
def app_request():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture(scope="session")
def client(app):  # pylint: disable=redefined-outer-name
    """Return a session-wide Flask test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def client_ctx(app):
    """Return session-wide Flask test client."""
    with app.test_client() as _client:
        yield _client

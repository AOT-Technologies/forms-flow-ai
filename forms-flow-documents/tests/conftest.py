"""Common setup and fixtures for the pytest suite used by this service."""
import pytest
from formsflow_api_utils.utils import jwt as _jwt
from formsflow_api_utils.utils.startup import setup_jwt_manager
from formsflow_documents import create_app


@pytest.fixture(scope="session")
def app():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture(scope="function")
def app_ctx(event_loop):  # pylint: disable=unused-argument
    # def app_ctx():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")
    with _app.app_context():
        yield _app


@pytest.fixture
def config(app):  # pylint: disable=redefined-outer-name
    """Return the application config."""
    return app.config


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
def client_ctx(app):  # pylint: disable=redefined-outer-name
    """Return session-wide Flask test client."""
    with app.test_client() as _client:
        yield _client


@pytest.fixture(scope="session")
def jwt(app):
    """Return session-wide jwt manager."""
    return _jwt


@pytest.fixture(scope="session", autouse=True)
def auto(docker_services, app):
    """Spin up a keycloak instance and initialize jwt."""
    if app.config.get("USE_DOCKER_MOCK"):
        docker_services.start("keycloak")
        docker_services.wait_for_service("keycloak", 8081)
        setup_jwt_manager(app, _jwt)


@pytest.fixture(scope="session")
def docker_compose_files(pytestconfig):
    """Get the docker-compose.yml absolute path."""
    import os

    return [
        os.path.join(str(pytestconfig.rootdir), "tests/docker", "docker-compose.yml")
    ]

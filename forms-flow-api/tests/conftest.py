"""Common setup and fixtures for the pytest suite used by this service."""

import os
from unittest.mock import patch

import pytest
from alembic import command
from alembic.config import Config
from formsflow_api_utils.utils import jwt as _jwt
from formsflow_api_utils.utils.startup import setup_jwt_manager
from sqlalchemy import text

from formsflow_api import create_app
from formsflow_api.models import db as _db


@pytest.fixture(scope="session", autouse=True)
def app():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture(scope="function")
def app_request():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture
def client(app):  # pylint: disable=redefined-outer-name
    """Return a session-wide Flask test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def jwt(app):
    """Return session-wide jwt manager."""
    return _jwt


@pytest.fixture(scope="session")
def client_ctx(app):  # pylint: disable=redefined-outer-name
    """Return session-wide Flask test client."""
    with app.test_client() as _client:
        yield _client


@pytest.fixture(scope="session")
def database(app):  # pylint: disable=redefined-outer-name, invalid-name
    """Return a session-wide initialised database.

    Drops all existing tables - Meta follows Postgres FKs
    """
    # Run database migrations
    with app.app_context():
        drop_schema_sql = text(
            """DROP SCHEMA public CASCADE;
                             CREATE SCHEMA public;
                             GRANT ALL ON SCHEMA public TO postgres;
                             GRANT ALL ON SCHEMA public TO public;
                          """
        )

        sess = _db.session()
        sess.execute(drop_schema_sql)
        sess.commit()

        alembic_cfg = Config(f"{os.getcwd()}/migrations/alembic.ini")
        command.upgrade(alembic_cfg, "head")

        _db.create_all()
        return _db


@pytest.fixture(scope="function")
def session(app, database):  # pylint: disable=redefined-outer-name, invalid-name
    """Return a function-scoped session."""
    with app.app_context():
        # TODO, refactor to improve test execution time.
        truncate_all_expr = text(
            """SELECT 'TRUNCATE TABLE ' || table_schema || '.' || table_name || ' RESTART IDENTITY CASCADE;'
            FROM information_schema.tables WHERE table_schema = 'public'; """
        )

        sess = _db.session()
        for tr in sess.execute(truncate_all_expr).fetchall():
            sess.execute(text(tr[0]))

        conn = database.engine.connect()
        sess = database.session

        yield sess

        # Cleanup
        sess.remove()
        conn.close()


@pytest.fixture(scope="session", autouse=True)
def auto(docker_services, app):
    """Spin up a keycloak instance and initialize jwt."""
    print("HERE---->", app.config.get("USE_DOCKER_MOCK"))
    if app.config.get("USE_DOCKER_MOCK"):
        print("starting Keycloak")
        docker_services.start("keycloak")
        print("Waiting for Keycloak")
        docker_services.wait_for_service("keycloak", 8081)
        print("Setting JWT manager")
        setup_jwt_manager(app, _jwt)
        print("Starting BPM")
        docker_services.start("bpm")
        print("Starting analytics")
        docker_services.start("analytics")
        print("Starting forms")
        docker_services.start("forms")
        print("Starting proxy")
        docker_services.start("proxy")


@pytest.fixture(scope="session")
def docker_compose_files(pytestconfig):
    """Get the docker-compose.yml absolute path."""
    import os

    return [
        os.path.join(str(pytestconfig.rootdir), "tests/docker", "docker-compose.yml")
    ]


@pytest.fixture
def mock_redis_client():
    """Mock Redis client that will act as a simple key-value store."""

    class MockRedis:
        """Mock redis class."""

        def __init__(self):
            self.store = {}

        def set(self, key, value, ex=None):
            self.store[key] = value

        def get(self, key):
            return self.store.get(key)

    mock_redis = MockRedis()

    # Patch the RedisManager.get_client to return the mock_redis
    with patch(
        "formsflow_api_utils.utils.caching.RedisManager.get_client",
        return_value=mock_redis,
    ) as _mock:  # noqa
        yield mock_redis

"""Common setup and fixtures for the pytest suite used by this service."""

import os

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
    if app.config.get("USE_DOCKER_MOCK"):
        docker_services.start("keycloak")
        docker_services.wait_for_service("keycloak", 8081)
        setup_jwt_manager(app, _jwt)

        docker_services.start("bpm")
        docker_services.start("analytics")
        docker_services.start("forms")
        docker_services.start("proxy")


@pytest.fixture(scope="session")
def docker_compose_files(pytestconfig):
    """Get the docker-compose.yml absolute path."""
    import os

    return [
        os.path.join(str(pytestconfig.rootdir), "tests/docker", "docker-compose.yml")
    ]

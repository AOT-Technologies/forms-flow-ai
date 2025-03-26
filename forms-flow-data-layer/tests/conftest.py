import os
import sys
import pytest
import asyncio
from src.db import webapi_db, bpmn_db
from src.db.formio_db import FormioDbConnection

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


@pytest.fixture(scope="session")
async def async_webapi_db():
    """
    Session-scoped fixture to initialize the WebAPI PostgreSQL database.
    """
    await webapi_db.init_db()
    try:
        yield webapi_db  # Yield the actual database connection object
    finally:
        await webapi_db.close_connection()


@pytest.fixture(scope="session")
async def async_bpm_db():
    """
    Session-scoped fixture to initialize the BPM PostgreSQL database.
    """
    await bpmn_db.init_db()
    yield bpmn_db
    await bpmn_db.close_connection()


@pytest.fixture(scope="session")
async def async_formio_db():
    """
    Session-scoped fixture to initialize the MongoDB connection for Formio.
    """
    formio_conn = FormioDbConnection()
    await formio_conn.init_formio_db()
    yield formio_conn.get_db()
    # Cleanup: close the underlying Motor client connection.
    formio_conn._FormioDbConnection__client.close()

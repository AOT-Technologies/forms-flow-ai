"""All of the configuration for the api is captured here.

All items are loaded, or have Constants defined here that
are loaded into the Flask configuration.
All modules and lookups get their configuration from the
Flask config, rather than reading environment variables directly
or by accessing this configuration directly.
"""

import os

from dotenv import find_dotenv, load_dotenv

# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

CONFIGURATION = {
    "development": "formsflow_api.config.DevConfig",
    "testing": "formsflow_api.config.TestConfig",
    "production": "formsflow_api.config.ProdConfig",
    "default": "formsflow_api.config.ProdConfig",
}


def get_named_config(config_name: str = "production"):
    """Return the configuration object based on the name.

    :raise: KeyError: if an unknown configuration is requested
    """
    if config_name in ["production", "staging", "default"]:
        config = ProdConfig()
    elif config_name == "testing":
        config = TestConfig()
    elif config_name == "development":
        config = DevConfig()
    else:
        raise KeyError(f"Unknown configuration '{config_name}'")
    return config


class _Config:  # pylint: disable=too-few-public-methods
    """Base class configuration.

    that should set reasonable defaults for all the other configurations.
    """

    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY = "secret value"

    TESTING = False
    DEBUG = False

    # API Base URL (Self)
    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")

    # Formio url
    FORMIO_URL = os.getenv("FORMIO_URL")
    FORMIO_USERNAME = os.getenv("FORMIO_ROOT_EMAIL")
    FORMIO_PASSWORD = os.getenv("FORMIO_ROOT_PASSWORD")


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")
    # Use docker to spin up mocks
    USE_DOCKER_MOCK = os.getenv("USE_DOCKER_MOCK", "False").lower() == "true"


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", None)
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        # print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = False
    DEBUG = False

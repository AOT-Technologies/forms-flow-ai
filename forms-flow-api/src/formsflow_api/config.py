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

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    ALEMBIC_INI = "migrations/alembic.ini"

    # POSTGRESQL
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "")

    TESTING = False
    DEBUG = False

    # JWT_OIDC Settings
    JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv("JWT_OIDC_WELL_KNOWN_CONFIG")
    JWT_OIDC_ALGORITHMS = os.getenv("JWT_OIDC_ALGORITHMS", "RS256")
    JWT_OIDC_JWKS_URI = os.getenv("JWT_OIDC_JWKS_URI")
    JWT_OIDC_ISSUER = os.getenv("JWT_OIDC_ISSUER")
    JWT_OIDC_AUDIENCE = os.getenv("JWT_OIDC_AUDIENCE")
    JWT_OIDC_CACHING_ENABLED = os.getenv("JWT_OIDC_CACHING_ENABLED")
    JWT_OIDC_JWKS_CACHE_TIMEOUT = 300

    # Keycloak Service for BPM Camunda
    BPM_TOKEN_API = os.getenv("BPM_TOKEN_API")
    BPM_CLIENT_ID = os.getenv("BPM_CLIENT_ID")
    BPM_CLIENT_SECRET = os.getenv("BPM_CLIENT_SECRET")
    BPM_GRANT_TYPE = os.getenv("BPM_GRANT_TYPE", "client_credentials")

    # BPM Camunda Details
    BPM_API_BASE = os.getenv("BPM_API_BASE")

    # API Base URL (Self)
    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")
    # Analytics API End points
    ANALYTICS_API_URL = os.getenv("INSIGHT_API_URL")
    ANALYTICS_API_KEY = os.getenv("INSIGHT_API_KEY")

    # Keycloak Admin Service
    KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
    KEYCLOAK_URL_REALM = os.getenv("KEYCLOAK_URL_REALM")


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")
    # POSTGRESQL
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_TEST")

    # JWT_OIDC_TEST_MODE = True
    # USE_TEST_KEYCLOAK_DOCKER = os.getenv("USE_TEST_KEYCLOAK_DOCKER")
    USE_DOCKER_MOCK = os.getenv('USE_DOCKER_MOCK', default=None)

    # JWT_OIDC Settings
    JWT_OIDC_TEST_AUDIENCE = os.getenv("JWT_OIDC_AUDIENCE")
    JWT_OIDC_TEST_ISSUER = os.getenv("JWT_OIDC_ISSUER")
    JWT_OIDC_TEST_WELL_KNOWN_CONFIG = os.getenv("JWT_OIDC_WELL_KNOWN_CONFIG")
    JWT_OIDC_TEST_ALGORITHMS = os.getenv("JWT_OIDC_ALGORITHMS")
    JWT_OIDC_TEST_JWKS_URI = os.getenv("JWT_OIDC_JWKS_URI")
    JWT_OIDC_TEST_JWKS_CACHE_TIMEOUT = 6000


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

"""All of the configuration for the api is captured here.

All items are loaded, or have Constants defined here that
are loaded into the Flask configuration.
All modules and lookups get their configuration from the
Flask config, rather than reading environment variables directly
or by accessing this configuration directly.
"""

import os
import sys

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

    # POSTGRESQL
<<<<<<< HEAD:forms-flow-data-analysis-api/src/api/config.py
    SQLALCHEMY_DATABASE_URI = os.getenv("DATA_ANALYSIS_DB_URL", "")
    # SQLALCHEMY_ECHO = True
=======
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
>>>>>>> develop:forms-flow-api/src/formsflow_api/config.py

    TESTING = False
    DEBUG = False

    # JWT_OIDC Settings
    JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv("JWT_OIDC_WELL_KNOWN_CONFIG")
    JWT_OIDC_ALGORITHMS = os.getenv("JWT_OIDC_ALGORITHMS")
    JWT_OIDC_JWKS_URI = os.getenv("JWT_OIDC_JWKS_URI")
    JWT_OIDC_ISSUER = os.getenv("JWT_OIDC_ISSUER")
    JWT_OIDC_AUDIENCE = os.getenv("JWT_OIDC_AUDIENCE")
    JWT_OIDC_CACHING_ENABLED = os.getenv("JWT_OIDC_CACHING_ENABLED")
    JWT_OIDC_JWKS_CACHE_TIMEOUT = 300

<<<<<<< HEAD:forms-flow-data-analysis-api/src/api/config.py
    DATA_ANALYSIS_API_BASE_URL = os.getenv("DATA_ANALYSIS_API_BASE_URL", default="")

    DB_PG_CONFIG = {
        "host": "forms-flow-data-analysis-db",
        "port": "5432",
        "dbname": os.getenv("POSTGRES_DB"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
    }
    # SQLALCHEMY_DATABASE_URI = 'postgresql://{user}:{password}@{host}:{port}/{name}'.format(
    #     user=DB_PG_CONFIG['user'], password=DB_PG_CONFIG['password'], host=DB_PG_CONFIG['host'],
    #     port=int(DB_PG_CONFIG['port']), name=DB_PG_CONFIG['dbname']
    # )
=======
    # Keycloak Service for BPM Camunda
    BPM_TOKEN_API = os.getenv("BPM_TOKEN_API")
    BPM_CLIENT_ID = os.getenv("BPM_CLIENT_ID")
    BPM_CLIENT_SECRET = os.getenv("BPM_CLIENT_SECRET")
    BPM_GRANT_TYPE = os.getenv("BPM_GRANT_TYPE", "client_credentials")

    # BPM Camunda Details
    BPM_API_BASE = os.getenv("BPM_API_BASE")

    # API Base URL (Self)
    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")
    ## Analytics API End points
    ANALYTICS_API_URL = os.getenv("INSIGHT_API_URL")
    ANALYTICS_API_KEY = os.getenv("INSIGHT_API_KEY")

    # Keycloak Admin Service username
    KEYCLOAK_ADMIN_USERNAME = os.getenv("KEYCLOAK_ADMIN_USERNAME")
    KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD")
    KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
    KEYCLOAK_URL_REALM = os.getenv("KEYCLOAK_URL_REALM")
>>>>>>> develop:forms-flow-api/src/formsflow_api/config.py


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

<<<<<<< HEAD:forms-flow-data-analysis-api/src/api/config.py
=======
    FORMSFLOW_API_URL = os.getenv("WEB_API_BASE_URL")
    # POSTGRESQL
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_TEST")

    # JWT_OIDC_TEST_MODE = True
    # USE_TEST_KEYCLOAK_DOCKER = os.getenv("USE_TEST_KEYCLOAK_DOCKER")

    # JWT_OIDC Settings
    JWT_OIDC_TEST_AUDIENCE = os.getenv("JWT_OIDC_AUDIENCE")
    JWT_OIDC_TEST_ISSUER = os.getenv("JWT_OIDC_ISSUER")
    JWT_OIDC_TEST_WELL_KNOWN_CONFIG = os.getenv("JWT_OIDC_WELL_KNOWN_CONFIG")
    JWT_OIDC_TEST_ALGORITHMS = os.getenv("JWT_OIDC_ALGORITHMS")
    JWT_OIDC_TEST_JWKS_URI = os.getenv("JWT_OIDC_JWKS_URI")
    JWT_OIDC_TEST_JWKS_CACHE_TIMEOUT = 6000


>>>>>>> develop:forms-flow-api/src/formsflow_api/config.py

class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = True
    DEBUG = False

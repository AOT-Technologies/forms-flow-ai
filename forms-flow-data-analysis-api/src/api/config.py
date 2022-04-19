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

from .utils.enumerator import Service

# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

CONFIGURATION = {
    "development": "api.config.DevConfig",
    "testing": "api.config.TestConfig",
    "production": "api.config.ProdConfig",
    "default": "api.config.ProdConfig",
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
    # SQLALCHEMY_DATABASE_URI = os.getenv("DATA_ANALYSIS_DB_URL", "")
    # SQLALCHEMY_ECHO = True

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

    DATA_ANALYSIS_API_BASE_URL = os.getenv("DATA_ANALYSIS_API_BASE_URL", default="")

    DATABASE_SUPPORT = os.getenv("DATABASE_SUPPORT", default=Service.DISABLED.value)

    DB_PG_CONFIG = {
        "host": os.getenv("POSTGRES_DB_HOST", "forms-flow-data-analysis-db"),
        "port": os.getenv("POSTGRES_DB_PORT", "5432"),
        "dbname": os.getenv("POSTGRES_DB"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
    }
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://"
        f"{DB_PG_CONFIG['user']}:{DB_PG_CONFIG['password']}"
        f"@{DB_PG_CONFIG['host']}:{int(DB_PG_CONFIG['port'])}/{DB_PG_CONFIG['dbname']}"
    )
    MODEL_ID = os.getenv("MODEL_ID")


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_TEST")


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    SECRET_KEY = os.getenv("SECRET_KEY", None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = True
    DEBUG = False

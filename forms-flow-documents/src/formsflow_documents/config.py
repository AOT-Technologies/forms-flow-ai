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
    "development": "formsflow_documents.config.DevConfig",
    "testing": "formsflow_documents.config.TestConfig",
    "production": "formsflow_documents.config.ProdConfig",
    "default": "formsflow_documents.config.ProdConfig",
}


def get_named_config(config_name: str = "production"):
    """Return the configuration object based on the name.

    :raise: KeyError: if an unknown configuration is requested
    """
    if config_name in ["production", "staging", "default"]:
        config = ProdConfig()
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

    # Formio url
    FORMIO_URL = os.getenv("FORMIO_URL")
    FORMIO_USERNAME = os.getenv("FORMIO_ROOT_EMAIL")
    FORMIO_PASSWORD = os.getenv("FORMIO_ROOT_PASSWORD")

    # API Base URL (Self)
    FORMSFLOW_DOC_API_URL = os.getenv("FORMSFLOW_DOC_API_URL")
    CHROME_DRIVER_PATH = os.getenv("CHROME_DRIVER_PATH", "/usr/local/bin/chromedriver")

    CUSTOM_SUBMISSION_URL = os.getenv("CUSTOM_SUBMISSION_URL", "")
    CUSTOM_SUBMISSION_ENABLED = (
        os.getenv("CUSTOM_SUBMISSION_ENABLED", "false").lower() == "true"
    )

    # Keycloak client authorization enabled flag
    KEYCLOAK_ENABLE_CLIENT_AUTH = (
        str(os.getenv("KEYCLOAK_ENABLE_CLIENT_AUTH", default="false")).lower() == "true"
    )
    MULTI_TENANCY_ENABLED = (
        str(os.getenv("MULTI_TENANCY_ENABLED", default="false")).lower() == "true"
    )


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


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

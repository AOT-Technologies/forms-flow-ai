import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class DatabaseConfig:
    """
    Utility class to construct database connection URIs
    for different database types
    """

    @staticmethod
    def construct_mongodb_uri(
        host: str = "localhost",
        port: str = "27017",
        username: str = "",
        password: str = "",
        database: str = "formio",
        options: str = "",
    ) -> str:
        """
        Construct a MongoDB connection URI with optional authentication
        """
        if username and password:
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            uri = f"mongodb://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
        else:
            uri = f"mongodb://{host}:{port}"

        if options:
            uri += f"?{options}"

        return uri

    @staticmethod
    def construct_postgres_uri(
        host: str = "localhost",
        port: str = "5432",
        username: str = "",
        password: str = "",
        database: str = "",
        options: str = "",
    ) -> str:
        """
        Construct a PostgreSQL connection URI
        """
        # Construct base connection string
        if username and password:
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            base_uri = f"postgresql://{encoded_username}:{encoded_password}@{host}:{port}/{database}"
        else:
            base_uri = f"postgresql://{host}:{port}/{database}"

        # Append options if provided
        if options:
            base_uri += f"?{options}"

        return base_uri


class ENVS:
    # FormIO MongoDB Configuration
    FORMIO_DB_HOST: str = os.getenv("FORMIO_MONGO_HOST", "localhost")
    FORMIO_DB_PORT: str = os.getenv("FORMIO_MONGO_PORT", "27017")
    FORMIO_DB_USERNAME: str = os.getenv("FORMIO_DB_USERNAME", "")
    FORMIO_DB_PASSWORD: str = os.getenv("FORMIO_DB_PASSWORD", "")
    FORMIO_DB_NAME: str = os.getenv("FORMIO_DB_NAME", "formio")
    FORMIO_DB_OPTIONS: str = os.getenv("FORMIO_MONGO_OPTIONS", "")

    # Web API PostgreSQL Configuration
    FORMSFLOW_API_DB_HOST: str = os.getenv("FORMSFLOW_API_DB_HOST", "localhost")
    FORMSFLOW_API_DB_PORT: str = os.getenv("FORMSFLOW_API_DB_PORT", "5432")
    FORMSFLOW_API_DB_USER: str = os.getenv("FORMSFLOW_API_DB_USER", "")
    FORMSFLOW_API_DB_PASSWORD: str = os.getenv("FORMSFLOW_API_DB_PASSWORD", "")
    FORMSFLOW_API_DB_NAME: str = os.getenv("FORMSFLOW_API_DB_NAME", "webapi")
    FORMSFLOW_API_DB_OPTIONS: str = os.getenv("FORMSFLOW_API_DB_OPTIONS", "")

    # BPM PostgreSQL Configuration
    CAMUNDA_DB_USER: str = os.getenv("CAMUNDA_DB_USER", "localhost")
    CAMUNDA_DB_PASSWORD: str = os.getenv("CAMUNDA_DB_PASSWORD", "5432")
    CAMUNDA_DB_HOST: str = os.getenv("CAMUNDA_DB_HOST", "")
    CAMUNDA_DB_PORT: str = os.getenv("CAMUNDA_DB_PORT", "")
    CAMUNDA_DB_NAME: str = os.getenv("CAMUNDA_DB_NAME", "bpm")
    CAMUNDA_DB_OPTIONS: str = os.getenv("CAMUNDA_DB_OPTIONS", "")

    # Constructed Connection URIs
    FORMIO_MONGO_DB_URI: str = os.getenv(
        "FORMIO_DB_URI",
        DatabaseConfig.construct_mongodb_uri(
            host=FORMIO_DB_HOST,
            port=FORMIO_DB_PORT,
            username=FORMIO_DB_USERNAME,
            password=FORMIO_DB_PASSWORD,
            database=FORMIO_DB_NAME,
            options=FORMIO_DB_OPTIONS,
        ),
    )

    WEB_API_DB_URL: str = os.getenv(
        "FORMSFLOW_API_DB_URL",
        DatabaseConfig.construct_postgres_uri(
            host=FORMSFLOW_API_DB_HOST,
            port=FORMSFLOW_API_DB_PORT,
            username=FORMSFLOW_API_DB_USER,
            password=FORMSFLOW_API_DB_PASSWORD,
            database=FORMSFLOW_API_DB_NAME,
            options=FORMSFLOW_API_DB_OPTIONS,
        ),
    )

    CAMUNDA_DB_URL = os.getenv("CAMUNDA_DB_URL", None)
    CAMUNDA_DB_URL = (
        CAMUNDA_DB_URL[len("jdbc:") :]
        if CAMUNDA_DB_URL and CAMUNDA_DB_URL.startswith("jdbc:")
        else CAMUNDA_DB_URL
    )
    BPM_DB_URL: str = CAMUNDA_DB_URL or DatabaseConfig.construct_postgres_uri(
        host=CAMUNDA_DB_USER,
        port=CAMUNDA_DB_PASSWORD,
        username=CAMUNDA_DB_HOST,
        password=CAMUNDA_DB_PORT,
        database=CAMUNDA_DB_NAME,
        options=CAMUNDA_DB_OPTIONS,
    )

    # Other configurations
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    CORS_ALLOWED_ORIGINS = os.getenv("FORMSFLOW_DATALAYER_CORS_ORIGINS", "*")
    JWT_OIDC_ALGORITHMS = os.getenv("JWT_OIDC_ALGORITHMS", "RS256")
    JWT_OIDC_JWKS_URI = os.getenv("JWT_OIDC_JWKS_URI")
    JWT_OIDC_ISSUER = os.getenv("JWT_OIDC_ISSUER")
    JWT_OIDC_AUDIENCE = os.getenv("JWT_OIDC_AUDIENCE")
    SQL_ECHO = os.getenv("SQL_ECHO", "False").lower() in ("true", "1", "yes")


# Create a singleton instance
ENVS = ENVS()

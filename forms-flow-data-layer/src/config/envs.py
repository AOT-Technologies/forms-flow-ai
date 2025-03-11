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
    FORMIO_MONGO_HOST: str = os.getenv("FORMIO_MONGO_HOST", "localhost")
    FORMIO_MONGO_PORT: str = os.getenv("FORMIO_MONGO_PORT", "27017")
    FORMIO_MONGO_USERNAME: str = os.getenv("FORMIO_MONGO_USERNAME", "")
    FORMIO_MONGO_PASSWORD: str = os.getenv("FORMIO_MONGO_PASSWORD", "")
    FORMIO_MONGO_DATABASE: str = os.getenv("FORMIO_MONGO_DATABASE", "formio")
    FORMIO_MONGO_OPTIONS: str = os.getenv("FORMIO_MONGO_OPTIONS", "")

    # Web API PostgreSQL Configuration
    WEB_API_DB_HOST: str = os.getenv("WEB_API_DB_HOST", "localhost")
    WEB_API_DB_PORT: str = os.getenv("WEB_API_DB_PORT", "5432")
    WEB_API_DB_USERNAME: str = os.getenv("WEB_API_DB_USERNAME", "")
    WEB_API_DB_PASSWORD: str = os.getenv("WEB_API_DB_PASSWORD", "")
    WEB_API_DB_NAME: str = os.getenv("WEB_API_DB_NAME", "webapi")
    WEB_API_DB_OPTIONS: str = os.getenv("WEB_API_DB_OPTIONS", "")

    # BPM PostgreSQL Configuration
    BPM_DB_HOST: str = os.getenv("BPM_DB_HOST", "localhost")
    BPM_DB_PORT: str = os.getenv("BPM_DB_PORT", "5432")
    BPM_DB_USERNAME: str = os.getenv("BPM_DB_USERNAME", "")
    BPM_DB_PASSWORD: str = os.getenv("BPM_DB_PASSWORD", "")
    BPM_DB_NAME: str = os.getenv("BPM_DB_NAME", "bpm")
    BPM_DB_OPTIONS: str = os.getenv("BPM_DB_OPTIONS", "")

    # Constructed Connection URIs
    FORMIO_MONGO_DB_URI: str = os.getenv(
        "FORMIO_MONGO_DB_URI",
        DatabaseConfig.construct_mongodb_uri(
            host=FORMIO_MONGO_HOST,
            port=FORMIO_MONGO_PORT,
            username=FORMIO_MONGO_USERNAME,
            password=FORMIO_MONGO_PASSWORD,
            database=FORMIO_MONGO_DATABASE,
            options=FORMIO_MONGO_OPTIONS,
        ),
    )

    WEB_API_DB_URL: str = DatabaseConfig.construct_postgres_uri(
        host=WEB_API_DB_HOST,
        port=WEB_API_DB_PORT,
        username=WEB_API_DB_USERNAME,
        password=WEB_API_DB_PASSWORD,
        database=WEB_API_DB_NAME,
        options=WEB_API_DB_OPTIONS,
    )

    BPM_DB_URL: str = DatabaseConfig.construct_postgres_uri(
        host=BPM_DB_HOST,
        port=BPM_DB_PORT,
        username=BPM_DB_USERNAME,
        password=BPM_DB_PASSWORD,
        database=BPM_DB_NAME,
        options=BPM_DB_OPTIONS,
    )

    # Other configurations
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "*")


# Create a singleton instance
ENVS = ENVS()

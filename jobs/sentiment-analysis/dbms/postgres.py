"""Module to connect to the postgres database."""
import psycopg2


class PostgresConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector for the postgres database."""

    @staticmethod
    def connect(app_config):
        try:
            connection = psycopg2.connect(**app_config.DB_PG_CONFIG)
            return connection
        except Exception as err:
            raise err

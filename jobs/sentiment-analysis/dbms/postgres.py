"""Module to connect to the postgres database."""
import psycopg2
from config import _Config


class PostgresConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector for the postgres database."""

    @staticmethod
    def connect(app_config: _Config):
        """Establishes the connection with postgres."""
        try:
            connection = psycopg2.connect(**app_config.DB_PG_CONFIG)
            return connection
        except Exception as postgres_err:
            raise postgres_err

    @staticmethod
    def get_row_query(
        primary_keys: str,
        input_col: str,
        table_name: str,
        output_col: str,
        limit: int,
    ) -> str:
        """Returns database specific query for retrieving rows."""
        cols_to_query = f"{primary_keys},{input_col}"
        return (
            f"select {cols_to_query} from {table_name} where "
            f"{input_col} is not null and "
            f"coalesce({output_col}, '') = '' limit {limit}"
        )

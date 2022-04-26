"""Module to connect to the postgres database."""
import psycopg2


class PostgresConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector for the postgres database."""

    @staticmethod
    def connect(app_config):
        """Establishes the connection with postgres."""
        try:
            connection = psycopg2.connect(**app_config.DB_PG_CONFIG)
            return connection
        except Exception as err:
            raise err

    @staticmethod
    def get_row_query(primary_keys, input_col, table_name, output_col, limit) -> str:
        """Returns database specific query for retrieving rows."""
        cols_to_query = f"{primary_keys},{input_col}"
        return (
            f"select {cols_to_query} from {table_name} where "
            f"{input_col} is not null and "
            f"coalesce({output_col}, '') = '' limit {limit}"
        )

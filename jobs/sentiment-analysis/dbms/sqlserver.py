"""Module to connect to the sqlserver database."""
import pymssql
from config import _Config


class SqlServerConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector to the sqlserver database."""

    @staticmethod
    def connect(app_config: _Config):
        """Establishes the connection with sqlsqerver."""
        try:
            connection = pymssql.connect(  # pylint: disable=no-member
                **app_config.DB_MSSQL_CONFIG
            )
            return connection
        except Exception as sqlserver_err:
            raise sqlserver_err

    @staticmethod
    def get_row_query(  # pylint: disable-msg=too-many-arguments
        primary_keys: str,
        input_col: str,
        table_name: str,
        output_col: str,
        app_config: _Config,
        limit: int = 100,
    ) -> str:
        """Returns database specific query for retrieving rows."""
        cols_to_query = f"{primary_keys},{input_col}"
        if app_config.SCHEMA_NAME:
            table_name = f"{app_config.SCHEMA_NAME}.{table_name}"
        return (
            f"select top {limit} {cols_to_query} from {table_name} where "
            f"{input_col} is not null and "
            f"coalesce({output_col}, '') = ''"
        )

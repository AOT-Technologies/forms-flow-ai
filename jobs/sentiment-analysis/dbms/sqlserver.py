"""Module to connect to the sqlserver database."""
import pymssql


class SqlServerConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector to the sqlserver database."""

    @staticmethod
    def connect(app_config):
        """Establishes the connection with sqlsqerver."""
        try:
            connection = pymssql.connect(  # pylint: disable=no-member
                **app_config.DB_MSSQL_CONFIG
            )
            return connection
        except Exception as err:
            raise err

    @staticmethod
    def get_row_query(
        primary_keys, input_col, table_name, output_col, limit=100
    ) -> str:
        """Returns database specific query for retrieving rows."""
        cols_to_query = f"{primary_keys},{input_col}"
        return (
            f"select top {limit} {cols_to_query} from {table_name} where "
            f"{input_col} is not null and "
            f"coalesce({output_col}, '') = ''"
        )

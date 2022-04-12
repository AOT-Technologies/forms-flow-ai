"""Module to connect to the sqlserver database."""
import pymssql


class SqlServerConnect:  # pylint: disable=too-few-public-methods
    """Provides the connector to the sqlserver database."""

    @staticmethod
    def connect(app_config):
        try:
            connection = pymssql.connect(**app_config.DB_MSSQL_CONFIG)  # pylint: disable=no-member
            return connection
        except Exception as err:
            raise err

"""This module provides the client to make the connection with the given database."""
from typing import Dict
from config import _Config
from .sqlserver import SqlServerConnect


class DatabaseClient:
    """Initializes the connector with the DatabaseFactory object and provides a connector."""

    def __init__(self, factory_obj) -> None:
        """
        Initializes the factory object.
        :factory_obj : object of type DatabaseFactory.
        """
        self.__connector = factory_obj

    def connect(self, database_value, app_config):
        """Selectes the database system and returns its connection object."""
        try:
            database = self.__connector.get_database(database_value)
            return database.connect(app_config)
        except Exception as err:
            raise err

    def get_row_query(  # pylint: disable=too-many-arguments
        self,
        database_value: int,
        primary_keys: str,
        input_col: str,
        table_name: str,
        output_col: str,
        app_config: _Config,
        limit: int = 100,
    ) -> str:
        """
        Selects the database and returns its row query.
        : database_value: database representation value.
        : primary_keys: primary key field of the table.
        : input_col: column name that we need to perform analysis on.
        : table_name: name of the database table.
        : output_col: name of the output column.
        : limit: number of rows to return, default is 100
        """
        if (
            primary_keys is None or
            input_col is None or
            table_name is None or
            output_col is None or
            database_value is None
        ):
            raise Exception("Missing parameters")
        database = self.__connector.get_database(database_value)
        args: Dict = {
            "primary_keys": primary_keys,
            "input_col": input_col,
            "table_name": table_name,
            "output_col": output_col,
            "app_config": app_config,
            "limit": limit,
        }
        if not isinstance(database, SqlServerConnect):
            del args["app_config"]
        return database.get_row_query(**args)

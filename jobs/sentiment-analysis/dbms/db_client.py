"""This module provides the client to make the connection with the given database."""


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
        cols_to_query: str,
        table_name: str,
        output_col: str,
        limit: int = 100,
    ) -> str:
        """
        Selects the database and returns its row query.

        : database_value: database representation value.
        : cols_to_query: comma seperated column names to select from the table.
                        example: "id, input_text"
        : table_name: name of the database table.
        : output_col: name of the output column.
        : limit: number of rows to return, default is 100
        """
        if (
            cols_to_query is None or
            table_name is None or
            output_col is None or
            database_value is None
        ):
            raise Exception("Missing parameters")
        database = self.__connector.get_database(database_value)
        return database.get_row_query(cols_to_query, table_name, output_col, limit)

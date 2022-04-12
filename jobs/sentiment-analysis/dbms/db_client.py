"""This module provides the client for the application to make the connection with the given database."""


class DatabaseClient:  # pylint: disable=too-few-public-methods
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

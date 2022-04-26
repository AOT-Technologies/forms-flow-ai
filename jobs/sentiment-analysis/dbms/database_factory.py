"""This module manages the database registration and retrieval."""


class DatabaseFactory:
    """Provides methods for regisetring and retrieving databases."""

    def __init__(self):
        """Initialize the object with empty dict."""
        self._databases = {}

    def register_database(self, database_value, creator):
        """Public method to register new database."""
        self._databases[database_value] = creator

    def get_database(self, database_value):
        """Public method to retrieve registered databases."""
        database = self._databases.get(database_value)
        if not database:
            raise ValueError(database_value)
        return database()

"""This module initializes the supported databases and the client to interact with them."""
from .database_factory import DatabaseFactory
from .postgres import PostgresConnect
from .sqlserver import SqlServerConnect
from .dbms_enum import Databse
from .db_client import DatabaseClient

factory = DatabaseFactory()
factory.register_database(Databse["POSTGRES"].value, PostgresConnect)
factory.register_database(Databse["SQL_SERVER"].value, SqlServerConnect)

client = DatabaseClient(factory)

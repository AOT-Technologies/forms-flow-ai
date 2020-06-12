from collections import defaultdict
from redash.query_runner import *
from redash.utils import json_dumps, json_loads

import logging

logger = logging.getLogger(__name__)


try:
    from pyhive import presto
    from pyhive.exc import DatabaseError

    enabled = True

except ImportError:
    enabled = False

PRESTO_TYPES_MAPPING = {
    "integer": TYPE_INTEGER,
    "tinyint": TYPE_INTEGER,
    "smallint": TYPE_INTEGER,
    "long": TYPE_INTEGER,
    "bigint": TYPE_INTEGER,
    "float": TYPE_FLOAT,
    "double": TYPE_FLOAT,
    "boolean": TYPE_BOOLEAN,
    "string": TYPE_STRING,
    "varchar": TYPE_STRING,
    "date": TYPE_DATE,
}


class Presto(BaseQueryRunner):
    noop_query = "SHOW TABLES"

    @classmethod
    def configuration_schema(cls):
        return {
            "type": "object",
            "properties": {
                "host": {"type": "string"},
                "protocol": {"type": "string", "default": "http"},
                "port": {"type": "number"},
                "schema": {"type": "string"},
                "catalog": {"type": "string"},
                "username": {"type": "string"},
                "password": {"type": "string"},
            },
            "order": [
                "host",
                "protocol",
                "port",
                "username",
                "password",
                "schema",
                "catalog",
            ],
            "required": ["host"],
        }

    @classmethod
    def enabled(cls):
        return enabled

    @classmethod
    def type(cls):
        return "presto"

    def get_schema(self, get_stats=False):
        schema = {}
        query = """
        SELECT table_schema, table_name, column_name
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        """

        results, error = self.run_query(query, None)

        if error is not None:
            raise Exception("Failed getting schema.")

        results = json_loads(results)

        for row in results["rows"]:
            table_name = "{}.{}".format(row["table_schema"], row["table_name"])

            if table_name not in schema:
                schema[table_name] = {"name": table_name, "columns": []}

            schema[table_name]["columns"].append(row["column_name"])

        return list(schema.values())

    def run_query(self, query, user):
        connection = presto.connect(
            host=self.configuration.get("host", ""),
            port=self.configuration.get("port", 8080),
            protocol=self.configuration.get("protocol", "http"),
            username=self.configuration.get("username", "redash"),
            password=(self.configuration.get("password") or None),
            catalog=self.configuration.get("catalog", "hive"),
            schema=self.configuration.get("schema", "default"),
        )

        cursor = connection.cursor()

        try:
            cursor.execute(query)
            column_tuples = [
                (i[0], PRESTO_TYPES_MAPPING.get(i[1], None)) for i in cursor.description
            ]
            columns = self.fetch_columns(column_tuples)
            rows = [
                dict(zip(([column["name"] for column in columns]), r))
                for i, r in enumerate(cursor.fetchall())
            ]
            data = {"columns": columns, "rows": rows}
            json_data = json_dumps(data)
            error = None
        except DatabaseError as db:
            json_data = None
            default_message = "Unspecified DatabaseError: {0}".format(str(db))
            if isinstance(db.args[0], dict):
                message = db.args[0].get("failureInfo", {"message", None}).get(
                    "message"
                )
            else:
                message = None
            error = default_message if message is None else message
        except (KeyboardInterrupt, InterruptException, JobTimeoutException):
            cursor.cancel()
            raise

        return json_data, error


register(Presto)

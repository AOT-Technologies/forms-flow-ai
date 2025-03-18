from src.config.envs import ENVS
from src.db.sql_base import ConnectSQLDatabase

webapi_db = ConnectSQLDatabase(ENVS.WEB_API_DB_URL)

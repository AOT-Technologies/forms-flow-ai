from src.config.envs import ENVS
from src.utils import ConnectSQLDatabase

webapi_db = ConnectSQLDatabase(ENVS.WEB_API_DB_URL)

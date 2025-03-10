from src.utils import ConnectSQLDatabase
from src.config.envs import ENVS
webapi_db = ConnectSQLDatabase(ENVS.WEB_API_DB_URL)

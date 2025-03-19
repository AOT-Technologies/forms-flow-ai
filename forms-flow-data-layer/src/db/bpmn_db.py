from src.config.envs import ENVS
from src.db.sql_base import ConnectSQLDatabase

bpmn_db = ConnectSQLDatabase(ENVS.BPM_DB_URL)

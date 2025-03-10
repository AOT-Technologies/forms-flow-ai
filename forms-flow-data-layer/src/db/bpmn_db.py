from src.config.envs import ENVS
from src.utils import ConnectSQLDatabase

bpmn_db = ConnectSQLDatabase(ENVS.BPM_DB_URL)

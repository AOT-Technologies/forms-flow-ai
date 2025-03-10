from src.utils import ConnectSQLDatabase
from src.config.envs import ENVS
bpmn_db = ConnectSQLDatabase(ENVS.BPM_DB_URL)

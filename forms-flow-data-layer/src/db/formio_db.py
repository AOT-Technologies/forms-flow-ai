"""Formio Db config."""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from src.config.envs import ENVS
from src.models.formio import Form, SubmissionsModel  # Import your MongoDB models
from src.utils import get_logger

logger = get_logger(__name__)


class FormioDbConnection:
    """Formio db connection handler."""

    def __init__(self) -> None:
        self.__client = None  #
        self.formio_db = None

    async def init_formio_db(self):
        """Initialize Beanie with document models."""
        logger.info("initialize formio db")
        self.__client = AsyncIOMotorClient(ENVS.FORMIO_MONGO_DB_URI)
        self.formio_db = self.__client[ENVS.FORMIO_DB_NAME]
        await init_beanie(
            database=self.formio_db, document_models=[Form, SubmissionsModel]
        )

    def get_db(self):
        """Get Formio DB client"""
        if self.formio_db is None:
            raise ValueError(
                "Database client is not initialized. Call init_formio_db() first."
            )
        return self.formio_db

    async def ping(self):
        """Get Formio DB client"""
        if self.formio_db is None:
            raise ValueError(
                "Database client is not initialized. Call init_formio_db() first."
            )
        return await self.formio_db.command("ping")

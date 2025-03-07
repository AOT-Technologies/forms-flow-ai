from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from src.config.envs import ENVS
from src.models.formio.form import FormModel  # Import your MongoDB models


class FormioDbConnection:
    def __init__(self) -> None:
        self.__client = None  # 
        self.formio_db = None

    async def init_formio_db(self):
        """Initialize Beanie with document models."""
        self.__client = AsyncIOMotorClient(ENVS.FORMIO_MONGO_DB_URI)
        self.formio_db = self.__client[ENVS.FORMIO_MONGO_DATABASE]
        await init_beanie(database=self.formio_db, document_models=[FormModel])

    def get_db(self):
        """Get Formio DB client"""
        if self.formio_db is None:
            raise ValueError("Database client is not initialized. Call init_formio_db() first.")
        return self.formio_db

    async def ping(self):
        """Get Formio DB client"""
        if self.formio_db is None:
            raise ValueError("Database client is not initialized. Call init_formio_db() first.")
        return await self.formio_db.command("ping")
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from src.config.envs import ENVS
from src.models.formio.form import FormModel  # Import your MongoDB models


async def init_formio_db():
    """Initialize Beanie with document models."""
    client = AsyncIOMotorClient(ENVS.FORMIO_MONGO_DB_URI)
    mongo_db = client[ENVS.FORMIO_MONGO_DATABASE]
    await init_beanie(database=mongo_db, document_models=[FormModel])

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.utils import get_logger

logger = get_logger(__name__)

class ConnectSQLDatabase:
    _instances = {}  # Store multiple DB connections

    def __new__(cls, db_url: str):
        """Ensure only one connection per database URL"""
        if db_url not in cls._instances:
            cls._instances[db_url] = super().__new__(cls)
        return cls._instances[db_url]

    def __init__(self, db_url: str):
        if not hasattr(self, "initialized"):
            self.__db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")  # Use async driver
            self.metadata = MetaData()
            self.initialized = True  # Prevent reinitialization
            self.__engine = create_async_engine(
                self.__db_url, pool_size=5, max_overflow=10, echo=True
            )
            self.__session_factory = sessionmaker(
                bind=self.__engine, class_=AsyncSession, expire_on_commit=False
            )
            self._tables_cache = {}  # Cache for reflected tables

    async def init_db(self):
        """Initialize the database connection and reflect metadata"""
        async with self.__engine.begin() as conn:
            await conn.run_sync(self.metadata.reflect)  # Reflect all tables
            self._tables_cache = self.metadata.tables  # Store tables in cache
            logger.info(f"✅ Connected to Database: {self.__db_url}")

    async def get_session(self):
        """Return a new session for the database"""
        return self.__session_factory()

    async def get_table(self, table_name: str):
        """Get a reflected table object from the database, using cache if available"""
        if table_name in self._tables_cache:
            return self._tables_cache[table_name]  # Return cached table

        async with self.__engine.connect() as conn:
            await conn.run_sync(self.metadata.reflect, only=[table_name])  # Reflect only if not in cache

        if table_name not in self.metadata.tables:
            raise ValueError(f"Table '{table_name}' not found in the database.")

        self._tables_cache[table_name] = self.metadata.tables[table_name]  # Cache the newly reflected table
        return self.metadata.tables[table_name]

    async def close_connection(self):
        """Close the database connection"""
        await self.__engine.dispose()
        logger.info(f"❌ Connection closed for {self.__db_url}")
        if self.__db_url in ConnectSQLDatabase._instances:
            del ConnectSQLDatabase._instances[self.__db_url]  # Remove from cache
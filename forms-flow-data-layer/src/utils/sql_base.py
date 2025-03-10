from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.orm import sessionmaker


class ConnectSQLDatabase:
    _instances = {}  # Store multiple DB connections

    def __new__(cls, db_url: str):
        """Ensure only one connection per database URL"""
        if db_url not in cls._instances:
            cls._instances[db_url] = super(ConnectSQLDatabase, cls).__new__(cls)
        return cls._instances[db_url]

    def __init__(self, db_url: str) -> None:
        if not hasattr(self, "initialized"):
            self.__db_url = db_url
            self.__engine = None
            self.__session_factory = None
            self.metadata = MetaData()
            self.initialized = True  # Prevent reinitialization

    def init_db(self):
        """Initialize the database connection"""
        if not self.__engine:  # Prevent reinitialization
            self.__engine = create_engine(
                self.__db_url, pool_size=5, max_overflow=10, echo=True
            )
            self.__session_factory = sessionmaker(
                autocommit=False, autoflush=False, bind=self.__engine
            )
            self.metadata.reflect(bind=self.__engine)  # Reflect all tables from DB
            print(f"✅ Connected to Database: {self.__db_url}")

    def get_session(self):
        """Return a new session for the database"""
        if not self.__session_factory:
            raise RuntimeError(
                "Database session is not initialized. Call `init_db()` first."
            )
        return self.__session_factory()

    def get_table(self, table_name: str):
        """Get a reflected table object from the database"""
        if not self.__engine:
            raise RuntimeError(
                "Database connection is not initialized. Call `init_db()` first."
            )
        return Table(table_name, self.metadata, autoload_with=self.__engine)

    def close_connection(self):
        """Close the database connection"""
        if self.__engine:
            self.__engine.dispose()
            print(f"❌ Connection closed for {self.__db_url}")
            if self.__db_url in ConnectSQLDatabase._instances:
                del ConnectSQLDatabase._instances[self.__db_url]  # Remove from cache

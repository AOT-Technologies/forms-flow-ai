from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


class ConnectSQLDatabase:
    _instances = {}  # Store multiple DB connections

    def __new__(cls, db_url: str):
        """Ensure only one connection per database URL"""
        if db_url not in cls._instances:
            cls._instances[db_url] = super(ConnectSQLDatabase, cls).__new__(cls)
        return cls._instances[db_url]

    def __init__(self, db_url) -> None:
        self.__db_url = db_url
        self.__engine = None
        self.__session_factory = None
        self.base = None

    def init_db(self):
        """Initialize the database connection"""
        self.__engine = create_engine(
            self.__db_url, pool_size=5, max_overflow=10, echo=True
        )
        self.__session_factory = sessionmaker(
            autocommit=False, autoflush=False, bind=self.__engine
        )
        self.base = declarative_base()
        print(f"✅ Connected to Database: {self.__db_url}")

    def get_session(self):
        """Return a new session for the database"""
        return self.__session_factory()

    def close_connection(self):
        """Close the database connection"""
        if self.__engine:
            self.__engine.dispose()
            print(f"❌ Connection closed for {self.__db_url}")
            del ConnectSQLDatabase._instances[self.__db_url]  # Remove from cache

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import application modules
from src import FormioDbConnection, bpmn_db, grphql_app, redis_cache, webapi_db
from src.config.envs import ENVS
from src.routes import HealthCheck
from src.utils import get_logger

# logger
logger = get_logger(__name__)

# Environment-based CORS configuration
ALLOWED_ORIGINS = ENVS.CORS_ALLOWED_ORIGINS.split(",")

# formio db
formio_db = FormioDbConnection()


async def connect_db(db_name, connection):
    """Generic function to initialize a database/cache connection asynchronously."""
    try:
        await connection()
        logger.info(f"✅ {db_name} initialized successfully")
    except Exception as error:
        logger.warning(f"⚠️ {db_name} connection failed: {error}", exc_info=True)


@asynccontextmanager
async def on_startup(app: FastAPI):
    """Lifespan event for startup and shutdown"""
    try:
        # List of services to initialize
        connections = {
            "FormIO Database": formio_db.init_formio_db,
            "Redis Cache": redis_cache.connect,
            "Webapi Database": webapi_db.init_db,
            "Camunda Database": bpmn_db.init_db,
        }
        # Initialize all connections asynchronously
        await asyncio.gather(
            *(connect_db(name, conn) for name, conn in connections.items())
        )

        yield  # Application is running

    except Exception as e:
        logger.error(f"🚨 Critical startup error: {e}", exc_info=True)
        raise

    finally:
        logger.info("🛑 Application shutdown initiated")


def create_app() -> FastAPI:
    """Factory function to create FastAPI application"""
    app = FastAPI(
        title="Forms Flow GraphQL Service",
        description="GraphQL API for Forms Flow",
        version="0.1.0",
        lifespan=on_startup,
        docs_url="/docs",  # API documentation endpoint
        redoc_url="/redoc",  # Alternative API docs
    )

    # Security: CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,  # Configurable origins
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],  # Restrict methods
        allow_headers=["Authorization", "Content-Type"],  # Restrict headers
    )

    # Include GraphQL Router
    app.include_router(grphql_app, prefix="/queries")

    return app


# Create application instance
app = create_app()


@app.get("/health", tags=["Health Check"])
async def health_check():
    return await HealthCheck.health_check(
        formio_db=formio_db,
        redis_cache=redis_cache,
        webapi_db=webapi_db,
        bpmn_db=bpmn_db,
    )

import uvicorn
import asyncio

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.envs import ENVS
from src.utils import get_logger
# Import application modules
from src import grphql_app, FormioDbConnection, redis_cache

 
# logger
logger = get_logger(__name__)

# Environment-based CORS configuration
ALLOWED_ORIGINS = ENVS.CORS_ALLOWED_ORIGINS.split(",")

## Dbs
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
        }
        # Initialize all connections asynchronously
        await asyncio.gather(*(connect_db(name, conn) for name, conn in connections.items()))

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
        allow_methods=["GET","POST","OPTIONS"],  # Restrict methods
        allow_headers=["Authorization", "Content-Type"],  # Restrict headers
    )

    # Include GraphQL Router
    app.include_router(grphql_app, prefix="/queries")

    return app


# Create application instance
app = create_app()


@app.get("/health", tags=["Health Check"])
async def health_check():
    """🔍 Health check endpoint with real-time DB & cache status"""
    try:
        formio_db_ping = await formio_db.ping()
        db_status = "connected" if  formio_db_ping.get("ok")  else "disconnected"
        cache_status = "connected" if await redis_cache.redis.ping() else "disconnected"

        return {
            "status": "healthy" if db_status == "connected" and cache_status == "connected" else "unhealthy",
            "components": {
                "formio": db_status,
                "cache": cache_status,
            },
        }
    except Exception as e:
         logger.error(f"🚨 Critical startup error: {e}", exc_info=True)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5500, log_level="info")
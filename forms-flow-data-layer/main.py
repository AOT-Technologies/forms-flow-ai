import logging
import uvicorn

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.envs import ENVS

# Import application modules
from src import grphql_app, init_formio_db, redis_cache

 
# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
    handlers=[
        logging.StreamHandler()  # Logs to console
    ],
)
logger = logging.getLogger("main")

# Environment-based CORS configuration
ALLOWED_ORIGINS = ENVS.CORS_ALLOWED_ORIGINS.split(",")

@asynccontextmanager
async def on_startup(app: FastAPI):
    """Lifespan event for startup and shutdown"""
    try:
        # Initialize database connection
        try:
            await init_formio_db()
            logger.info("✅ FormIO Database initialized successfully")
        except Exception as db_error:
            logger.warning(f"⚠️ Database connection failed: {db_error}", exc_info=True)

        # Connect to Redis cache
        try:
            await redis_cache.connect()
            logger.info("✅ Redis cache connected successfully")
        except Exception as redis_error:
            logger.warning(f"⚠️ Redis connection failed: {redis_error}", exc_info=True)

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
    db_status = "connected" if await redis_cache.redis.ping() else "disconnected"
    cache_status = "connected" if await redis_cache.redis.ping() else "disconnected"

    return {
        "status": "healthy" if db_status == "connected" and cache_status == "connected" else "unhealthy",
        "components": {
            "database": db_status,
            "cache": cache_status,
        },
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
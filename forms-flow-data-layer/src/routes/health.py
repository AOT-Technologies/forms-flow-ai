"""Health check Router."""

import asyncio

from sqlalchemy import text

from src.utils import get_logger

logger = get_logger(__name__)


class HealthCheck:
    """
    HealthCheck class to perform real-time health checks
    on multiple services (DBs, cache) concurrently.

    Ensures:
    - Non-blocking async execution
    - Safe session/connection handling
    - High scalability
    """

    @staticmethod
    async def check_formio(formio_db):
        """Check Formio DB connection."""
        try:
            formio_db_ping = await formio_db.ping()
            return "connected" if formio_db_ping.get("ok") else "disconnected"
        except Exception as e:
            logger.warning(f"Formio DB check failed: {e}")
            return "disconnected"

    @staticmethod
    async def check_cache(redis_cache):
        """Check Redis cache connection."""
        try:
            return "connected" if await redis_cache.redis.ping() else "disconnected"
        except Exception as e:
            logger.warning(f"Redis Cache check failed: {e}")
            return "disconnected"

    @staticmethod
    async def check_webapi(webapi_db):
        """Check WebAPI DB connection."""
        try:
            async with await webapi_db.get_session() as session:
                await session.execute(text("SELECT 1"))
            return "connected"
        except Exception as e:
            logger.warning(f"WebAPI DB check failed: {e}")
            return "disconnected"

    @staticmethod
    async def check_bpmn(bpmn_db):
        """Check BPMN DB connection."""
        try:
            async with await bpmn_db.get_session() as session:
                await session.execute(text("SELECT 1"))
            return "connected"
        except Exception as e:
            logger.warning(f"BPMN DB check failed: {e}")
            return "disconnected"

    @staticmethod
    async def health_check(formio_db, bpmn_db, webapi_db, redis_cache):
        """
        Perform all health checks concurrently.

        Returns:
            dict: Overall status and individual component statuses.
        """
        try:
            formio_task = HealthCheck.check_formio(formio_db)
            cache_task = HealthCheck.check_cache(redis_cache)
            webapi_task = HealthCheck.check_webapi(webapi_db)
            bpmn_task = HealthCheck.check_bpmn(bpmn_db)

            # Run concurrently
            results = await asyncio.gather(
                formio_task, cache_task, webapi_task, bpmn_task
            )

            components = {
                "formio": results[0],
                "cache": results[1],
                "webapi": results[2],
                "bpmn": results[3],
            }
            healthy = all(status == "connected" for status in components.values())

            return {
                "status": "healthy" if healthy else "unhealthy",
                "components": components,
            }

        except Exception as e:
            logger.error(f"Critical Health Check Error: {e}", exc_info=True)
            return {"status": "unhealthy"}

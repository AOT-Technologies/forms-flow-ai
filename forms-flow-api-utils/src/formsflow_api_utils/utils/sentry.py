"""Centralized setup of sentry integration."""
import sentry_sdk


def init_sentry(app):
    """Initialize sentry."""
    if sentry_dsn := app.config.get("SENTRY_DSN"):
        sentry_sdk.init(
            dsn=sentry_dsn,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
        )

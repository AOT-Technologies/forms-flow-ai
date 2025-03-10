import logging

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
    handlers=[logging.StreamHandler()],  # Logs to console
)


def get_logger(name: str):
    """Dynamically creates a logger for each module."""
    return logging.getLogger(name)

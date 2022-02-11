"""Centralized setup of logging for the service."""

import logging.config
import sys
from os import path


def setup_logging(conf):
    """Create the services logger."""
    if conf and path.isfile(conf):
        logging.config.fileConfig(conf)
        print(f"Configure logging, from conf:{conf}", file=sys.stdout)
    else:
        print(
            f"Unable to configure logging, attempted conf:{conf}",
            file=sys.stderr,
        )
    return logging.getLogger(__name__)


def log_error(msg):
    """Log error."""
    logging.error(msg)


def log_bpm_error(msg):
    """Log error."""
    logging.error(msg)
    logging.error(
        """The connection with Python and Camunda API is not proper.
        Ensure you have passed env variables properly and
        have set listener in Keycloak(camunda-rest-api)"""
    )


def log_info(msg):
    """Log info."""
    logging.info(msg)

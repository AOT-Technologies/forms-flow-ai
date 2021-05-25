"""Centralized setup of logging for the service."""

import logging.config
import sys
from os import path


def setup_logging(conf):
    """Create the services logger."""
    if conf and path.isfile(conf):
        logging.config.fileConfig(conf)
        print("Configure logging, from conf:{}".format(conf), file=sys.stdout)
    else:
        print(
            "Unable to configure logging, attempted conf:{}".format(conf),
            file=sys.stderr,
        )


def log_error(msg):
    """Log error."""
    logging.error(msg)


def log_info(msg):
    """Log info."""
    logging.info(msg)

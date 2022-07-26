"""Module handle the console display formatting."""
import logging


class CustomFormatter(logging.Formatter):
    """Class extends the logging Formatter class to support custom colour messages."""

    blue = "\x1b[34;21m"
    grey = "\x1b[38;21m"
    green = "\x1b[32;1m"
    yellow = "\x1b[33;21m"
    red = "\x1b[31;21m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    __format = (
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"
    )

    FORMATS = {
        logging.DEBUG: blue + __format + reset,
        logging.INFO: green + __format + reset,
        logging.WARNING: yellow + __format + reset,
        logging.ERROR: red + __format + reset,
        logging.CRITICAL: bold_red + __format + reset,
    }

    def format(self, record):
        """Returns the formatted information."""
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

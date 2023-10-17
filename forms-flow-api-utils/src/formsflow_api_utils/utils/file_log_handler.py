"""Module to handle custom file log handler."""
import gzip
import logging
import logging.handlers
import os
import shutil


class CustomTimedRotatingFileHandler(logging.handlers.TimedRotatingFileHandler):
    """A custom log file handler that extends TimedRotatingFileHandler and customizes log rotation."""

    def __init__(self, filename, when="d", interval=1, backupCount=0):
        """Initializes the handler."""
        super().__init__(filename, when, interval, backupCount)
        file_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"
        self.setFormatter(logging.Formatter(file_format))
        self.namer = self._namer
        self.rotator = self._rotator

    def _namer(self, name):
        """Custom log file namer that appends ".gz" to the file name."""
        return name + ".gz"

    def _rotator(self, source, dest):
        """
        Custom log file rotator that compresses the log file and moves it to the archive folder.

        Args:
            source (str): The path to the source log file.
            dest (str): The path to the destination log file (within the archive folder).
        """
        archive_folder = os.path.join(os.path.dirname(dest), "archive")
        if not os.path.exists(archive_folder):
            os.makedirs(archive_folder)

        dest_in_archive = os.path.join(archive_folder, os.path.basename(dest))

        with open(source, "rb") as f_in:
            with gzip.open(dest_in_archive, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
        os.remove(source)

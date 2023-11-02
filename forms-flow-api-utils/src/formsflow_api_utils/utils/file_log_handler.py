"""Module to handle custom file log handler."""
import gzip
import logging
import logging.handlers
import os
import shutil

from .format import CustomFormatter


class CustomTimedRotatingFileHandler(logging.handlers.TimedRotatingFileHandler):
    """A custom log file handler that extends TimedRotatingFileHandler and customizes log rotation."""

    def __init__(self, filename, when="d", interval=1, backupCount=7):
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

        if not os.path.exists(dest_in_archive):
            with open(source, "rb") as f_in:
                with gzip.open(dest_in_archive, "wb") as f_out:
                    print(dest_in_archive, "open dest file")
                    shutil.copyfileobj(f_in, f_out)
            os.remove(source)

    def getFilesToDelete(self):
        """Override the getFilesToDelete method.

        Determine the files to delete when rollover occurs.
        Returns a list of file names to delete.
        """
        dir_name, base_name = os.path.split(self.baseFilename)
        dir_name = os.path.join(dir_name, "archive")
        file_names = os.listdir(dir_name)
        result = []
        prefix = base_name + "."
        plen = len(prefix)
        for filename in file_names:
            if filename[:plen] == prefix:
                suffix = filename[plen:]
                if self.extMatch.match(suffix):
                    result.append(os.path.join(dir_name, filename))
        if len(result) < self.backupCount:
            result = []
        else:
            result.sort()
            result = result[: len(result) - self.backupCount]
        return result


def register_log_handlers(app, log_file, when, interval, backupCount):
    """Configure console and file log handlers."""
    logs = logging.StreamHandler()
    logs.setFormatter(CustomFormatter())
    log_dir = os.path.dirname(log_file)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    file_handler = CustomTimedRotatingFileHandler(log_file, when, interval, backupCount)
    app.logger.handlers = [logs, file_handler]

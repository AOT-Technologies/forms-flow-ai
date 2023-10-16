"""Module to handle custom file log handler."""
import gzip
import os
import shutil
from datetime import datetime, timedelta
from logging.handlers import TimedRotatingFileHandler


class CustomTimedRotatingFileHandler(TimedRotatingFileHandler):
    """Custom Handler for logging to a file."""

    def __init__(  # pylint: disable=too-many-arguments
        self,
        filename,
        when="D",
        interval=1,
        backup_count=0,
        encoding=None,
        delay=False,
        utc=False,
    ):
        """Initializes the handler."""
        super().__init__(filename, when, interval, backup_count, encoding, delay, utc)

    def doRollover(self):
        """Do a rollover. Compress the previous day's log file and move it to an archive folder."""
        super().doRollover()

        log_dir = os.path.dirname(self.baseFilename)
        base_name = os.path.splitext(os.path.basename(self.baseFilename))[0]
        prev_day = datetime.now().strftime("%Y-%m-%d")
        # prev_day = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        prev_day_log = f"{base_name}.log.{prev_day}"

        prev_day_log_path = os.path.join(log_dir, prev_day_log)
        archive_dir = os.path.join(log_dir, "archive")

        if os.path.exists(prev_day_log_path):
            # Create the archive folder if it doesn't exist
            if not os.path.exists(archive_dir):
                os.makedirs(archive_dir)

            # Zip and move the log file to the archive folder
            archive_log_path = os.path.join(archive_dir, prev_day_log + ".gz")
            with open(prev_day_log_path, "rb") as log_file:
                with gzip.open(archive_log_path, "wb") as archive_file:
                    shutil.copyfileobj(log_file, archive_file)
            os.remove(prev_day_log_path)

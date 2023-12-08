"""Tests for file log handler."""
import os

from api.utils.file_log_handler import register_log_handlers


def test_file_log_valid_data(app):
    """Assert file logging with valid data."""
    log_file_path = "logs/forms-flow-data-analysis-api.log"
    register_log_handlers(
        app,
        log_file=log_file_path,
        when=os.getenv("API_LOG_ROTATION_WHEN", "d"),
        interval=int(os.getenv("API_LOG_ROTATION_INTERVAL", "1")),
        backup_count=int(os.getenv("API_LOG_BACKUP_COUNT", "7")),
    )
    app.logger.info("Test log..")
    assert os.path.exists(log_file_path) == True
    with open(log_file_path, "r") as log_file:
        log_contents = log_file.read()
        assert "Test log.." in log_contents
        log_file.close()


def test_file_log_with_missing_file(app, capsys):
    """Assert with missing file path."""
    log_file_path = ""
    register_log_handlers(
        app,
        log_file=log_file_path,
        when=os.getenv("API_LOG_ROTATION_WHEN", "d"),
        interval=int(os.getenv("API_LOG_ROTATION_INTERVAL", "1")),
        backup_count=int(os.getenv("API_LOG_BACKUP_COUNT", "7")),
    )
    out, err = capsys.readouterr()
    assert "Unable to configure file logging.." in out

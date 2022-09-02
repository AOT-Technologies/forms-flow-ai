"""Tests to assure the logging utilities.

Test-Suite to ensure that the logging setup is working as expected.
"""
# import os
from formsflow_api_utils.utils.logging import setup_logging

# def test_logging_with_file(capsys):
#     """Assert that logging is setup with the configuration file."""
#     file_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf")
#     setup_logging(file_path)  # important to do this first

#     captured = capsys.readouterr()

#     assert captured.out.startswith("Configure logging, from conf")

#     log_info("log info")
#     log_error("log error")


def test_logging_with_missing_file(capsys):
    """Assert that a message is sent to STDERR when the configuration doesn't exist."""
    file_path = None
    setup_logging(file_path)  # important to do this first

    captured = capsys.readouterr()

    assert captured.err.startswith("Unable to configure logging")

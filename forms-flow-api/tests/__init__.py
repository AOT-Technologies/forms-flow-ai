"""The Test Suites to ensure that the service is built and operating correctly."""
"""decorators used to skip/run pytests based on local setup."""
import os

import pytest
from dotenv import find_dotenv, load_dotenv

# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

skip_in_ci = pytest.mark.skipif(os.getenv('SKIP_IN_CI', 'false').lower() == 'true', reason='Skip test when running in CI')

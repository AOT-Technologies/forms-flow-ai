"""Manage the database and some other items required to run the API."""

import logging

from flask_migrate import Migrate

# models included so that migrate can build the database migrations
from api import create_app


APP = create_app()

if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    APP.run()

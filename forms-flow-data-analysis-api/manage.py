"""Manage the database and some other items required to run the API."""

import logging
from api import create_app

APP = create_app()

if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    APP.run()

"""Manage the database and some other items required to run the API."""

import logging

from flask_migrate import Migrate, MigrateCommand

# models included so that migrate can build the database migrations
from api import create_app
from api.models import db


APP = create_app()
MIGRATE = Migrate(APP, db)
MANAGER = Manager(APP)

MANAGER.add_command('db', MigrateCommand)

if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    MANAGER.run()

"""Manage the database and some other items required to run the API."""

import logging

from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

# models included so that migrate can build the database migrations
from formsflow_api import models  # noqa: F401 # pylint: disable=unused-import
from formsflow_api import create_app
from formsflow_api.models import db


APP = create_app()
MIGRATE = Migrate(APP, db)
MANAGER = Manager(APP)

MANAGER.add_command('db', MigrateCommand)

if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    MANAGER.run()

"""Manage the database and some other items required to run the API."""

import logging

from flask_migrate import Migrate

# models included so that migrate can build the database migrations
from formsflow_api import models  # noqa: F401 # pylint: disable=unused-import
from formsflow_api import create_app
from formsflow_api.models import db
from flask.cli import FlaskGroup

APP = create_app()
cli = FlaskGroup(APP)

MIGRATE = Migrate(APP, db)

if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    cli()

"""Manage the database and some other items required to run the API."""

import logging
from flask_script import Manager
from formsflow_documents import create_app


APP = create_app()
MANAGER = Manager(APP)
if __name__ == '__main__':
    logging.log(logging.INFO, 'Running the Manager')
    MANAGER.run()

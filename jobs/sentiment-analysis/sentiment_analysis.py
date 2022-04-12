"""Generate account statements.

This module will create statement records for each account.
"""

import os
import threading

import psycopg2
from transformers import pipeline
from api.services.transformers import overall_sentiment_transformers
from flask import Flask

import config
from utils.logger import setup_logging, log_info

from dbms import client, Databse

setup_logging(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'logging.conf'))  # important to do this first
APP_CONFIG = config.get_named_config(os.getenv('DEPLOYMENT_ENV', 'production'))


class LoadModel:  # pylint: disable=too-few-public-methods
    """Manages the model."""

    classifier = None
    model_id = APP_CONFIG.MODEL_ID

    @classmethod
    def preload_models(cls):
        """Function to load the fine-tuned transformer model."""
        cls.classifier = pipeline("sentiment-analysis", model=cls.model_id, truncation=True)
        return 0
# pylint:disable=no-member


def create_app(run_mode=os.getenv('FLASK_ENV', 'production')):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(config.CONFIGURATION[run_mode])
    app.logger.info('<<<< Starting Sentiment analysis job >>>>')
    register_shellcontext(app)
    preloading = threading.Thread(target=LoadModel.preload_models)
    preloading.start()
    log_info("Model is loading...")
    preloading.join()
    log_info("Model loading complete.")
    app.classifier = LoadModel.classifier
    return app


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {
            'app': app
        }  # pragma: no cover

    app.shell_context_processor(shell_context)


def update_sentiment():
    """Update sentiment by querying the records."""
    conn = None
    try:
        log_info("Starting sentiment analysis.")
        # connect to the PostgreSQL server
        conn = client.connect(Databse[APP_CONFIG.DBMS].value, APP_CONFIG)

        table_name = APP_CONFIG.DATABASE_TABLE_NAME
        input_col = APP_CONFIG.DATABASE_INPUT_COLUMN
        output_col = APP_CONFIG.DATABASE_OUTPUT_COLUMN

        # Find primary key for the table.
        primary_keys = _find_primary_keys(conn, table_name)
        log_info(f"found primary keys : {primary_keys}")
        # Query the rows from table.
        cols_to_query = f'{primary_keys},{input_col}'
        rows_query = f"select {cols_to_query} from {table_name} where coalesce({output_col}, '') = '' limit 100"
        log_info("Query executed")
        try:
            cur = conn.cursor()
            cur.execute(rows_query)
            colnames = [desc[0] for desc in cur.description]
            results = cur.fetchall()
        finally:
            cur.close()

        _perform_analysis(colnames, conn, results)

        # commit the changes
        conn.commit()

    except (Exception, psycopg2.DatabaseError) as error:  # noqa
        raise error
    finally:
        if conn is not None:
            conn.close()


def _find_primary_keys(conn, table_name):
    """Fetch the primary keys of rows that match the pf_query."""
    # Generalized query to support different databases.
    pk_query = f"SELECT column_name FROM information_schema.table_constraints AS tc " \
        f"JOIN information_schema.key_column_usage AS kc ON tc.CONSTRAINT_CATALOG = " \
        f"kc.CONSTRAINT_CATALOG AND tc.CONSTRAINT_SCHEMA = kc.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME " \
        f" = kc.CONSTRAINT_NAME AND tc.TABLE_CATALOG = kc.TABLE_CATALOG AND tc.TABLE_SCHEMA " \
        f"= kc.TABLE_SCHEMA AND tc.TABLE_NAME = kc.TABLE_NAME " \
        f"WHERE constraint_type = 'PRIMARY KEY' AND (tc.table_name) = ('{table_name}') ORDER BY ordinal_position;"
    try:
        cur = conn.cursor()
        cur.execute(pk_query)
        primary_keys = ','.join(cur.fetchall()[0])
    finally:
        cur.close()

    return primary_keys


def _perform_analysis(colnames, conn, results):
    # Create a list of dicts with column name and results.
    table_name = APP_CONFIG.DATABASE_TABLE_NAME
    input_col = APP_CONFIG.DATABASE_INPUT_COLUMN
    output_col = APP_CONFIG.DATABASE_OUTPUT_COLUMN

    query_results = [dict(zip(colnames, result)) for result in results]
    count: int = 0
    for result_dict in query_results:
        log_info(f"Finding sentiment for for {result_dict}")
        sentiment = overall_sentiment_transformers(result_dict.get(input_col))
        log_info(f"Sentiment {sentiment}")
        update_qry = f"update {table_name} set {output_col}='{sentiment}' where 1=1 "
        for key, value in result_dict.items():
            if key != input_col:
                update_qry += f" AND {key}='{value}' "

        try:
            cur = conn.cursor()
            cur.execute(update_qry)
        finally:
            cur.close()

        count += 1
    print(f'Updated {count} records')


def run():
    """Run the job."""
    application = create_app()
    application.app_context().push()
    update_sentiment()


if __name__ == '__main__':
    run()

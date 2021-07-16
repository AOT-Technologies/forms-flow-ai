"""Job to train the model and update the DB."""
import os
import shutil
from api.config import get_named_config
import psycopg2

CONFIG = get_named_config(os.getenv('FLASK_ENV', 'production'))


def run():
    """Train the model and upload it to DB."""
    # model_path = os.getcwd() + os.path.sep + 'src' + os.path.sep + 'api' + os.path.sep + 'services' + os.path.sep + 'models'
    model_path = os.getcwd() + os.path.sep + 'models'
    upload_to_database(model_path)


def upload_to_database(model_path: str):
    """"""
    shutil.make_archive('models', 'zip', model_path)

    conn = None
    try:
        # connect to the PostgreSQL server
        print('CONFIG ', CONFIG)
        print(CONFIG.TESTING)
        conn = psycopg2.connect(**{
            'host': 'localhost',
            'port': '54330',
            'dbname': 'postgres',
            'user': 'postgres',
            'password': 'admin'
        })
        print(conn)
        cur = conn.cursor()

        # Update the existing model as not active.
        inactivate_query = """update trained_model set active=false"""
        cur.execute(inactivate_query)

        # Insert new record.
        bytes_content = None
        with open('models.zip', 'rb') as file_data:
            bytes_content = file_data.read()

        postgres_insert_query = """ INSERT INTO trained_model (model, active) VALUES (%s,%s)"""
        record_to_insert = (bytes_content, True)
        cur.execute(postgres_insert_query, record_to_insert)

        conn.commit()
        count = cur.rowcount
        print(count, "Record inserted successfully into trained_model table")

        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    run()

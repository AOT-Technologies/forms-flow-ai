"""temp file"""
# import os
# import shutil

# import psycopg2

# from api.config import get_named_config

# CONFIG = get_named_config(os.getenv("FLASK_ENV", "production"))


# def create():
#     """create tables in the PostgreSQL database"""
#     commands = (
#         """
#         CREATE TABLE IF NOT EXISTS trained_model (
#             model bytea,
#             active boolean
#         )
#         """,
#     )
#     conn = None
#     try:
#         # connect to the PostgreSQL server
#         conn = psycopg2.connect(**CONFIG.DB_PG_CONFIG)
#         cur = conn.cursor()
#         # create table one by one
#         for command in commands:
#             cur.execute(command)
#         # close communication with the PostgreSQL database server
#         cur.close()
#         # commit the changes
#         conn.commit()
#     except (Exception, psycopg2.DatabaseError) as error:
#         raise error
#     finally:
#         if conn is not None:
#             conn.close()


# def load_model():
#     # Read latest model and set it to the spacy models.

#     conn = None
#     try:
#         # connect to the PostgreSQL server
#         conn = psycopg2.connect(**CONFIG.DB_PG_CONFIG)
#         cur = conn.cursor()
#         cur.execute("select model from trained_model where active=true")
#         data = cur.fetchall()[0]

#         zip_path = (
#             os.getcwd()
#             + os.path.sep
#             + "src"
#             + os.path.sep
#             + "api"
#             + os.path.sep
#             + "services"
#             + os.path.sep
#             + "models"
#         )
#         file_name = "models.zip"
#         zip_full_path = zip_path + os.path.sep + file_name
#         if not os.path.exists(zip_full_path):
#             open(zip_full_path, "w+").close()

#         f = open(zip_full_path, "wb")
#         f.write(data[0])
#         f.close()

#         # Extract the zip file
#         shutil.unpack_archive(zip_full_path, zip_path)
#         os.remove(zip_full_path)

#         # close communication with the PostgreSQL database server
#         cur.close()
#         # commit the changes
#         conn.commit()
#     except (Exception, psycopg2.DatabaseError) as error:
#         raise error
#     finally:
#         if conn is not None:
#             conn.close()


# if __name__ == "__main__":
#     create()

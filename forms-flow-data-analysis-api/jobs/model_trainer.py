# """Job to train the model and update the DB."""
# import os
# import shutil
# from pathlib import Path

# import psycopg2
# import spacy
# import random
# from api.config import get_named_config
# from spacy.util import minibatch, compounding


# CONFIG = get_named_config(os.getenv('FLASK_ENV', 'production'))


# def main(model=None, output_dir='../working/quick-spacy', n_iter=500,TRAIN_CORPUS='../working/corpus.json'):
#     """Load the model, set up the pipeline and train the entity recognizer."""
#     if model is not None:
#         nlp = spacy.load(model) # load existing spaCy model
#         print("Loaded model '%s'" % model)
#     else:
#         nlp = spacy.blank("en")  # create blank Language class
#         print("Created blank 'en' model")

#     # create the built-in pipeline components and add them to the pipeline
#     # nlp.create_pipe works for built-ins that are registered with spaCy
#     if "ner" not in nlp.pipe_names:
#         ner = nlp.create_pipe("ner")
#         nlp.add_pipe(ner, last=True)
#     # otherwise, get it so we can add labels
#     else:
#         ner = nlp.get_pipe("ner")

#     # add labels
#     for _, annotations in TRAIN_CORPUS:
#         for ent in annotations.get("entities"):
# #             print(ent[2])
#             ner.add_label(ent[2])

#     # get names of other pipes to disable them during training
#     pipe_exceptions = ["ner", "trf_wordpiecer", "trf_tok2vec"]
#     other_pipes = [pipe for pipe in nlp.pipe_names if pipe not in pipe_exceptions]
#     with nlp.disable_pipes(*other_pipes):  # only train NER
#         if model is None:
#             nlp.begin_training()
#         for _ in range(n_iter):
#             random.shuffle(TRAIN_CORPUS)
#             losses = {}
#             # batch up the examples using spaCy's minibatch
#             batches = minibatch(TRAIN_CORPUS, size=compounding(4.0, 32.0, 1.001))
#             for batch in batches:
#                 texts, annotations = zip(*batch)
#                 nlp.update(
#                     texts,  # batch of texts
#                     annotations,  # batch of annotations
#                     drop=0.5,  # dropout - make it harder to memorise data
#                     losses=losses,
#                 )
#             print("Losses", losses)

#     if output_dir is not None:
#         output_dir = Path(output_dir)
#         if not output_dir.exists():
#             output_dir.mkdir()
#         nlp.to_disk(output_dir)
#         print("Saved model to", output_dir)

#         # test the saved model
#         print("Loading from", output_dir)
#         nlp2 = spacy.load(output_dir)
#         for text, _ in TRAIN_CORPUS:
#             doc = nlp2(text)
#             print("Entities", [(ent.text, ent.label_) for ent in doc.ents])

# def run():
#     """Train the model and upload it to DB."""
#     model_path = Path.cwd().parents[0]/'models'
#     upload_to_database(model_path)


# def upload_to_database(model_path: str):
#     """"""
#     shutil.make_archive('models', 'zip', model_path)

#     conn = None
#     try:
#         # connect to the PostgreSQL server
#         print('CONFIG ', CONFIG)
#         print(CONFIG.TESTING)
#         conn = psycopg2.connect(**{
#             'host': 'localhost',
#             'port': '5432',
#             'dbname': 'postgres',
#             'user': 'postgres',
#             'password': 'aot123'
#         })
#         print(conn)
#         cur = conn.cursor()

#         # Update the existing model as not active.
#         inactivate_query = """update trained_model set active=false"""
#         cur.execute(inactivate_query)

#         # Insert new record.
#         bytes_content = None
#         with open('models.zip', 'rb') as file_data:
#             bytes_content = file_data.read()

#         postgres_insert_query = """ INSERT INTO trained_model (model, active) VALUES (%s,%s)"""
#         record_to_insert = (bytes_content, True)
#         cur.execute(postgres_insert_query, record_to_insert)

#         conn.commit()
#         count = cur.rowcount
#         print(count, "Record inserted successfully into trained_model table")

#         # close communication with the PostgreSQL database server
#         cur.close()
#         # commit the changes
#         conn.commit()
#     except (Exception, psycopg2.DatabaseError) as error:
#         print(error)
#     finally:
#         if conn is not None:
#             conn.close()


# if __name__ == "__main__":
#     run()

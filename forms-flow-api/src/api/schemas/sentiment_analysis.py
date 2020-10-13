from ..models import mongo


class SentimentAnalysisSchema(object):
    """Schema for creating pymongo database instance with associated fields.

    Methods like update, find, delete can be added later to support CRUD operation.
    """

    def __init__(self):
        self.fields = {"input_text": "string", "output_response": "collection"}

    def insert_sentiment(self, sentiment_object):
        # TODO: validate if all the object of database are currently there in required fields
        mongo_db = mongo.db.application_ai  # application_ai is collection name
        inserted = mongo_db.insert_one(sentiment_object)
        return f"Mongodb sentiment response created for {inserted.inserted_id}"

    def insert_entity(self, entity_object):
        mongo_db = mongo.db.entity_ai  # entity_ai is the collection name
        inserted = mongo_db.insert_many(entity_object)
        return "Mongodb entity response created "

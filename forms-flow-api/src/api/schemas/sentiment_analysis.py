import os
# from pymongo import MongoClient 
from flask_pymongo import PyMongo
from bson import ObjectId



class Database(object):
    def __init__(self):
        # self.client = MongoClient(config['db']['url'])  # configure db url
        # self.db = self.client[config['db']['name']]  # configure db name
        # mongodb machine connnect somehow
        self.collection_name = 'application_ai'
        self.fields = {
            "input_text": "string" ,
            "output_response": "collection" # pass the response as post request
        }
       

    def insert(self, sentiment_object):
        # if possible validate if all the object of database are currently there
        inserted = self.collection_name.insert(sentiment_object)# insert data to db mongo.db.posts as in hello.py
        id =  str(inserted.inserted_id)
        return f"Mongodb response created for {id}"

    def find():
        pass

    def update():
        pass

#     def find(self, criteria, collection_name, projection=None, sort=None, limit=0, cursor=False):  # find all from db

#         if "_id" in criteria:
#             criteria["_id"] = ObjectId(criteria["_id"])

#         found = self.db[collection_name].find(filter=criteria, projection=projection, limit=limit, sort=sort)

#         if cursor:
#             return found

#         found = list(found)

#         for i in range(len(found)):  # to serialize object id need to convert string
#             if "_id" in found[i]:
#                 found[i]["_id"] = str(found[i]["_id"])

#         return found

#     def find_by_id(self, id, collection_name):
#         found = self.db[collection_name].find_one({"_id": ObjectId(id)})
        
#         if found is None:
#             return not found
        
#         if "_id" in found:
#              found["_id"] = str(found["_id"])

#         return found

#     def update(self, id, element, collection_name):
#         criteria = {"_id": ObjectId(id)}

#         element["updated"] = datetime.now()
#         set_obj = {"$set": element}  # update value

#         updated = self.db[collection_name].update_one(criteria, set_obj)
#         if updated.matched_count == 1:
#             return "Record Successfully Updated"

#     def delete(self, id, collection_name):
#         deleted = self.db[collection_name].delete_one({"_id": ObjectId(id)})
#         return bool(deleted.deleted_count)
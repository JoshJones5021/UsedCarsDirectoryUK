from flask_mongoengine import MongoEngine
from pymongo import MongoClient
import logging

db = MongoEngine()
mongo_client = None

def init_mongo_client(app):
    global mongo_client
    if mongo_client is None:
        mongo_uri = app.config.get("MONGO_URI")
        logging.info(f"Mongo URI: {mongo_uri}")
        if not mongo_uri:
            raise Exception("Mongo URI is not set")
        
        mongo_client = MongoClient(mongo_uri)
        if not mongo_client:
            raise Exception("MongoDB client is not initialized")
        
        logging.info("MongoDB client initialized successfully")
    else:
        logging.info("MongoDB client already initialized")
    return mongo_client
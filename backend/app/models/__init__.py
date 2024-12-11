import logging

users_collection = None
cars_collection = None
owners_collection = None
services_collection = None

def initialize_collections(mongo_client):
    global users_collection, cars_collection, owners_collection, services_collection
    db = mongo_client.get_database()
    users_collection = db.get_collection('users')
    cars_collection = db.get_collection('cars')
    owners_collection = db.get_collection('owners')
    services_collection = db.get_collection('services')
    logging.info("Collections initialized successfully")
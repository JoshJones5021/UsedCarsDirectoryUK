import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_default_secret_key')
    DEBUG = os.environ.get('DEBUG', 'False') == 'True' 
    MONGO_URI = "mongodb://localhost:27017/UsedCarsDirectoryUK"
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'supersecretkey')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
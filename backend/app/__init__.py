import logging
from flask import Flask
from flask_jwt_extended import JWTManager
from .extensions import init_mongo_client, db
from .utils.auth import limiter, rate_limit_exceeded
from .models import initialize_collections
from .routes import register_blueprints
from .configs.config import Config
from app.utils.token_blacklist import is_token_blacklisted

logging.basicConfig(level=logging.INFO)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    mongo_client = init_mongo_client(app)
    initialize_collections(mongo_client)
    db.init_app(app)
    limiter.init_app(app) 
    jwt = JWTManager(app)
    register_blueprints(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return is_token_blacklisted(jti)
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return rate_limit_exceeded(e)

    return app
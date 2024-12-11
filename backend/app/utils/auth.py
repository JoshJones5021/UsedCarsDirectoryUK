from functools import wraps
import logging
from flask import jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import get_jwt_identity
import bcrypt

from app.models.user import User

limiter = Limiter(key_func=get_remote_address)

def rate_limit_exceeded(e):
    return jsonify({"error": "Too many attempts! Please try again in 1 minute"}), 429

def role_required(roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user = get_jwt_identity()
            logging.info(f"Current user from JWT: {current_user}")
            if current_user and current_user.get('role') in roles:
                return fn(*args, **kwargs)
            return jsonify({"message": "Access forbidden: You don't have the required role"}), 403
        return wrapper
    return decorator

def validate_email(email):
    import re
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def generate_password_hash(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def check_password_hash(pw_hash, password):
    return bcrypt.checkpw(password.encode('utf-8'), pw_hash.encode('utf-8'))
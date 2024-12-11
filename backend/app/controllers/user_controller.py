from bson import ObjectId
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.controllers.car_controller import CarController
from app.utils.auth import validate_email
from ..models import users_collection, cars_collection
from ..schemas.user_schema import UserSchema
from ..extensions import mongo_client
from ..utils.json_utils import json_serialize
import logging

user_schema = UserSchema()

class UserController:
    @staticmethod
    def register_user():
        try:
            data = request.json
            if not validate_email(data['email']):
                return jsonify({"message": "Invalid email format"}), 400
            existing_user = users_collection.find_one({"email": data['email']})
            if existing_user:
                return jsonify({"message": "User with this email already exists."}), 409
            hashed_password = generate_password_hash(data['password'])
            db_name = "UsedCarsDirectoryUK"
            db = mongo_client[db_name]
            current_time = db.command('serverStatus')['localTime']
            new_user = {
                "username": data['username'],
                "email": data['email'],
                "password": hashed_password,
                "full_name": data['full_name'],
                "role": "customer",
                "created_at": current_time,
                "last_updated": current_time
            }
            users_collection.insert_one(new_user)
            return jsonify({"message": "User registered successfully.", "email": data['email']}), 201
        
        except Exception as e:
            logging.error(f"Error in register_user: {e}")
            return jsonify({"message": "An error occurred while processing your request."}), 500

    @staticmethod
    def login_user():
        try:
            data = request.json
            allowed_fields = ['email', 'password']
            disallowed_fields = [key for key in data.keys() if key not in allowed_fields]
            if disallowed_fields:
                return jsonify({"message": f"Invalid fields: {', '.join(disallowed_fields)}"}), 400
            user = users_collection.find_one({"email": data['email']})
            if user and check_password_hash(user['password'], data['password']):
                user_id = str(user['_id'])
                access_token = create_access_token(identity={"user_id": user_id, "username": user['username'], "role": user['role']})
                return jsonify({"access_token": access_token}), 200
            else:
                return jsonify({"message": "Invalid email or password"}), 401
            
        except Exception as e:
            logging.error(f"Error in login_user: {e}")
            return jsonify({"message": "An error occurred while processing your request."}), 500

    @staticmethod
    def get_all_users():
        try:
            users = users_collection.find({}, {"password": 0})
            users_list = []
            for user in users:
                user['_id'] = json_serialize(user['_id'])
                users_list.append(user)
            return jsonify(users_list), 200
        
        except Exception as e:
            logging.error(f"Error in get_all_users: {e}")
            return jsonify({"message": str(e)}), 500
        
    @staticmethod
    def update_user_role(user_id):
        try:
            data = request.json
            new_role = data.get('role')
            if not new_role:
                return jsonify({"message": "Role is required"}), 400

            allowed_roles = ['admin', 'customer']
            if new_role not in allowed_roles:
                return jsonify({"message": f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}"}), 400

            result = users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": new_role}})
            if result.modified_count > 0:
                return jsonify({"message": "User role updated successfully."}), 200
            else:
                return jsonify({"message": "User not found or no changes made"}), 404

        except Exception as e:
            logging.error(f"Error in update_user_role: {e}")
            return jsonify({"message": "An error occurred while updating the user role."}), 500

    @staticmethod
    def update_user(current_user):
        try:
            data = request.json
            allowed_fields = ['email', 'full_name', 'username']
            disallowed_fields = [key for key in data.keys() if key not in allowed_fields]
            if disallowed_fields:
                return jsonify({"message": f"Invalid fields: {', '.join(disallowed_fields)}"}), 400
            
            if 'username' in data and data['username'] != current_user['username']:
                existing_user = users_collection.find_one({"username": data['username']})
                if existing_user:
                    return jsonify({"message": "Username already exists"}), 409
            
            filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
            result = users_collection.update_one({"username": current_user['username']}, {"$set": filtered_data})
            if result.modified_count > 0:
                return jsonify({"message": "User updated successfully."}), 200
            else:
                return jsonify({"message": "No changes were made"}), 200
            
        except Exception as e:
            logging.error(f"Error in update_user: {e}")
            return jsonify({"message": "An error occurred while processing your request."}), 500

    @staticmethod
    def get_user_details(current_user):
        try:
            user = users_collection.find_one(
                {"_id": ObjectId(current_user['user_id'])},
                {"username": 1, "email": 1, "full_name": 1, "role": 1}
            )
            if not user:
                return jsonify({"message": "User not found"}), 404
            user['_id'] = str(user['_id'])
            return jsonify(user), 200
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while retrieving the user."}), 500

    @staticmethod
    def delete_user(current_user):
        try:
            user = users_collection.find_one({"username": current_user['username']})
            if not user:
                return jsonify({"message": "User not found"}), 404
            user_id = str(user["_id"])

            cars = cars_collection.find({"current_owner.user_id": user_id})

            for car in cars:
                car_id = str(car["_id"])
                CarController.delete_car(user_id, car_id)
            result = users_collection.delete_one({"_id": ObjectId(user_id)})

            if result.deleted_count > 0:
                return jsonify({"message": "User and associated cars deleted successfully."}), 200
            else:
                return jsonify({"message": "User not found"}), 404
            
        except Exception as e:
            logging.error(f"Error in delete_user: {e}")
            return jsonify({"message": str(e)}), 500
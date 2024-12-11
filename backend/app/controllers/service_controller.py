from datetime import datetime
import logging
from bson import ObjectId
from flask import jsonify, request
from ..schemas.service_schema import ServiceSchema
from ..models import services_collection, users_collection, cars_collection
from ..utils.json_utils import json_serialize

service_schema = ServiceSchema()

class ServiceController:
    @staticmethod
    def add_service(car_id, user_id):
        try:
            user_id = user_id['user_id'] if isinstance(user_id, dict) else user_id
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                return jsonify({"message": "Permission denied"}), 403
            
            service_data = request.json
            service_data['car_id'] = ObjectId(car_id)

            if 'created_at' not in service_data:
                service_data['created_at'] = datetime.utcnow()

            service_data['created_at'] = service_data['created_at'].strftime("%d/%m/%Y %H:%M:%S") if isinstance(service_data['created_at'], datetime) else service_data['created_at']

            service_date_str = service_data.get('service_date')
            if service_date_str:
                try:
                    service_data['service_date'] = datetime.strptime(service_date_str, "%Y-%m-%d")
                except ValueError:
                    service_data['service_date'] = datetime.strptime(service_date_str, "%d-%m-%Y")
                service_data['service_date'] = service_data['service_date'].strftime("%d/%m/%Y")

            result = services_collection.insert_one(service_data)
            return jsonify({"message": "Service added successfully.", "service_id": str(result.inserted_id)}), 201
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while adding the service."}), 500

    @staticmethod
    def get_all_services(car_id):
        try:
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404

            services = list(services_collection.find({"car_id": ObjectId(car_id)}))
            for service in services:
                service['_id'] = json_serialize(service['_id'])
                service['car_id'] = json_serialize(service['car_id'])
                service['service_date'] = service['service_date'].strftime("%d/%m/%Y") if isinstance(service['service_date'], datetime) else service['service_date']

            services.sort(key=lambda x: datetime.strptime(x['service_date'], "%d/%m/%Y"), reverse=True)

            return jsonify(services), 200
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while fetching the services."}), 500

    @staticmethod
    def get_service(car_id, service_id):
        try:
            service = services_collection.find_one({"car_id": ObjectId(car_id), "_id": ObjectId(service_id)})
            if service:
                service['_id'] = json_serialize(service['_id'])
                service['car_id'] = json_serialize(service['car_id'])
                return jsonify(service), 200
            else:
                return jsonify({"message": "Service not found"}), 404
            
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while fetching the service."}), 500

    @staticmethod
    def update_service(car_id, service_id, user_id):
        try:
            user_id = user_id['user_id'] if isinstance(user_id, dict) else user_id
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                return jsonify({"message": "Permission denied"}), 403

            service_data = request.json
            service_data['last_updated'] = datetime.utcnow()

            # Remove the _id field from the update payload
            if '_id' in service_data:
                del service_data['_id']

            service_data['car_id'] = ObjectId(car_id)

            service_date_str = service_data.get('service_date')
            if service_date_str:
                try:
                    service_data['service_date'] = datetime.strptime(service_date_str, "%Y-%m-%d")
                except ValueError:
                    service_data['service_date'] = datetime.strptime(service_date_str, "%d-%m-%Y")
                service_data['service_date'] = service_data['service_date'].strftime("%d/%m/%Y")

            result = services_collection.update_one(
                {"_id": ObjectId(service_id)},
                {"$set": service_data}
            )
            if result.modified_count > 0:
                return jsonify({"message": "Service updated successfully."}), 200
            return jsonify({"message": "No changes made"}), 404
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while updating the service."}), 500

    @staticmethod
    def delete_service(car_id, service_id, user_id):
        try:
            user_id = user_id.get("user_id") if isinstance(user_id, dict) else user_id
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                return jsonify({"message": "Permission denied"}), 403
            result = services_collection.delete_one({"_id": ObjectId(service_id)})
            if result.deleted_count > 0:
                return jsonify({"message": "Service deleted successfully."}), 200
            return jsonify({"message": "Service not found"}), 404
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while deleting the service."}), 500
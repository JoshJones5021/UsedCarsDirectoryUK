import logging
from bson import ObjectId
from flask import jsonify, request
from marshmallow import ValidationError
from ..schemas.owner_schema import OwnerSchema
from ..models import owners_collection, cars_collection, users_collection
from datetime import datetime

owner_schema = OwnerSchema()

class OwnerController:
    @staticmethod
    def add_owner(car_id, owner_data, user_id=None, user_details=None):
        try:
            if user_id:
                user_id = user_id.get("user_id") if isinstance(user_id, dict) else user_id
                logging.info(f"Extracted user_id: {user_id}")
                user = users_collection.find_one({"_id": ObjectId(user_id)})
                if not user:
                    return jsonify({"message": "User not found"}), 404
                car = cars_collection.find_one({"_id": ObjectId(car_id)})
                if not car:
                    return jsonify({"message": "Car not found"}), 404
                logging.info(f"Car current_owner: {car['current_owner']}")
                if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                    logging.error(f"Permission denied for user_id: {user_id}")
                    return jsonify({"message": "Permission denied"}), 403
            owner_data['car_id'] = ObjectId(car_id)
            if 'created_at' not in owner_data:
                owner_data['created_at'] = datetime.utcnow()
            owner_data['created_at'] = owner_data['created_at'].strftime("%d/%m/%Y %H:%M:%S") if isinstance(owner_data['created_at'], datetime) else owner_data['created_at']
            owner_data['owner_name'] = owner_data.get('owner_name')
            purchase_date_str = owner_data.get('purchase_date')

            if purchase_date_str:
                try:
                    owner_data['purchase_date'] = datetime.strptime(purchase_date_str, "%Y/%m/%d")
                except ValueError:
                    owner_data['purchase_date'] = datetime.strptime(purchase_date_str, "%d/%m/%Y")
                owner_data['purchase_date'] = owner_data['purchase_date'].strftime("%d/%m/%Y")
            else:
                return jsonify({"message": "Purchase date is required"}), 400

            sold_date_str = owner_data.get('sold_date')
            if sold_date_str:
                try:
                    owner_data['sold_date'] = datetime.strptime(sold_date_str, "%Y/%m/%d")
                except ValueError:
                    owner_data['sold_date'] = datetime.strptime(sold_date_str, "%d/%m/%Y")
                owner_data['sold_date'] = owner_data['sold_date'].strftime("%d/%m/%Y")
            else:
                owner_data['sold_date'] = None

            owner_data['sale_price'] = owner_data.get('sale_price', None)

            if owner_data['sold_date']:
                new_owner_sold_date = datetime.strptime(owner_data['sold_date'], "%d/%m/%Y")
                new_owner_purchase_date = datetime.strptime(owner_data['purchase_date'], "%d/%m/%Y")
                if new_owner_sold_date < new_owner_purchase_date:
                    return jsonify({"message": "New owner's sold date cannot be earlier than their purchase date."}), 400

            existing_owners = list(owners_collection.find({"car_id": ObjectId(car_id)}))
            new_owner_purchase_date = datetime.strptime(owner_data['purchase_date'], "%d/%m/%Y")
            new_owner_sold_date = datetime.strptime(owner_data['sold_date'], "%d/%m/%Y") if owner_data['sold_date'] else None

            for existing_owner in existing_owners:
                existing_purchase_date = datetime.strptime(existing_owner['purchase_date'], "%d/%m/%Y") if existing_owner['purchase_date'] else None
                existing_sold_date = datetime.strptime(existing_owner['sold_date'], "%d/%m/%Y") if existing_owner['sold_date'] else None

                if new_owner_sold_date:
                    if existing_purchase_date and (new_owner_purchase_date < existing_purchase_date < new_owner_sold_date):
                        return jsonify({"message": "New owner's date range overlaps with an existing owner's date range."}), 400
                    if existing_sold_date and (new_owner_purchase_date < existing_sold_date < new_owner_sold_date):
                        return jsonify({"message": "New owner's date range overlaps with an existing owner's date range."}), 400
                else:
                    if existing_purchase_date and new_owner_purchase_date < existing_purchase_date:
                        return jsonify({"message": "New owner's purchase date overlaps with an existing owner's date range."}), 400
                    if existing_sold_date and new_owner_purchase_date <= existing_sold_date:
                        return jsonify({"message": "New owner's purchase date overlaps with an existing owner's date range."}), 400

            result = owners_collection.insert_one(owner_data)
            return jsonify({"message": "Owner added successfully.", "owner_id": str(result.inserted_id)}), 201
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while adding the owner."}), 500
        
    @staticmethod
    def get_ownership_history(car_id):
        try:
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404

            pipeline = [
                {"$match": {"car_id": ObjectId(car_id)}},
                {"$sort": {"purchase_date": -1}},
                {
                    "$project": {
                        "_id": 1,
                        "car_id": 1,
                        "owner_name": 1,
                        "purchase_date": 1,
                        "sale_price": 1,
                        "sold_date": 1,
                        "created_at": 1
                    }
                }
            ]
            owners = list(owners_collection.aggregate(pipeline))
            for owner in owners:
                owner['_id'] = str(owner['_id'])
                owner['car_id'] = str(owner['car_id'])
                owner['created_at'] = owner['created_at'].strftime("%d/%m/%Y %H:%M:%S") if isinstance(owner['created_at'], datetime) else owner['created_at']
                owner['purchase_date'] = owner['purchase_date'].strftime("%d/%m/%Y") if isinstance(owner['purchase_date'], datetime) else owner['purchase_date']
                owner['sold_date'] = owner['sold_date'].strftime("%d/%m/%Y") if isinstance(owner['sold_date'], datetime) else owner['sold_date']

            # Ensure logical date order
            for i in range(1, len(owners)):
                current_owner = owners[i]
                previous_owner = owners[i - 1]
                current_purchase_date = datetime.strptime(current_owner['purchase_date'], "%d/%m/%Y")
                previous_sold_date = datetime.strptime(previous_owner['sold_date'], "%d/%m/%Y") if previous_owner['sold_date'] else None

                if previous_sold_date and current_purchase_date < previous_sold_date:
                    return jsonify({"message": "Ownership dates are not in logical order."}), 400

            return jsonify(owners), 200
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while retrieving ownership history."}), 500

    @staticmethod
    def get_owner(car_id, owner_id):
        try:
            car_id = ObjectId(car_id) if not isinstance(car_id, ObjectId) else car_id
            owner_id = ObjectId(owner_id) if not isinstance(owner_id, ObjectId) else owner_id
            owner = owners_collection.find_one({"car_id": car_id, "_id": owner_id})
            if owner:
                owner['_id'] = str(owner['_id'])
                owner['car_id'] = str(owner['car_id'])
                owner['created_at'] = owner['created_at'].strftime("%d/%m/%Y %H:%M:%S") if isinstance(owner['created_at'], datetime) else owner['created_at']
                owner['purchase_date'] = owner['purchase_date'].strftime("%d/%m/%Y") if isinstance(owner['purchase_date'], datetime) else owner['purchase_date']
                owner['sold_date'] = owner['sold_date'].strftime("%d/%m/%Y") if isinstance(owner['sold_date'], datetime) else owner['sold_date']
                return jsonify(owner), 200
            else:
                return jsonify({"message": "Owner not found"}), 404
            
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while retrieving the owner."}), 500

    @staticmethod
    def update_owner(car_id, owner_id, user_id):
        try:
            owner_data = request.json
            user_id = user_id['user_id'] if isinstance(user_id, dict) else str(user_id)
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                return jsonify({"message": "Permission denied"}), 403

            # Remove the _id field from the update payload
            if '_id' in owner_data:
                del owner_data['_id']

            owner_data['car_id'] = ObjectId(car_id)

            result = owners_collection.update_one({"_id": ObjectId(owner_id)}, {"$set": owner_data})
            if result.modified_count > 0:
                return jsonify({"message": "Owner updated successfully."}), 200
            return jsonify({"message": "No changes made"}), 404
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while updating the owner."}), 500

    @staticmethod
    def delete_owner(car_id, owner_id, user_id):
        try:
            user_id = user_id.get("user_id") if isinstance(user_id, dict) else user_id
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                return jsonify({"message": "Car not found"}), 404
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                return jsonify({"message": "Permission denied"}), 403
            result = owners_collection.delete_one({"_id": ObjectId(owner_id)})
            if result.deleted_count > 0:
                return jsonify({"message": "Owner deleted successfully."}), 200
            return jsonify({"message": "Owner not found"}), 404
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while deleting the owner."}), 500
        
    @staticmethod
    def change_owner(car_id, current_user, new_owner_data):
        try:
            current_user_id = current_user.get("user_id") if isinstance(current_user, dict) else current_user
            logging.info(f"Extracted current_user_id: {current_user_id}")
            user = users_collection.find_one({"_id": ObjectId(current_user_id)})
            if not user:
                logging.error(f"User not found for user_id: {current_user_id}")
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                logging.error(f"Car not found for car_id: {car_id}")
                return jsonify({"message": "Car not found"}), 404
            logging.info(f"Car current_owner: {car['current_owner']}")

            if car["current_owner"]["user_id"] != current_user_id and user.get("role") != "admin":
                logging.error(f"Permission denied for user_id: {current_user_id}")
                return jsonify({"message": "Permission denied"}), 403

            new_owner_email = new_owner_data.get("email")
            if not new_owner_email:
                logging.error("New owner email not provided")
                return jsonify({"message": "New owner email not provided"}), 400
            new_owner = users_collection.find_one({"email": new_owner_email})
            if not new_owner:
                logging.error(f"New owner not found for email: {new_owner_email}")
                return jsonify({"message": "New owner not found"}), 404
            new_owner_full_name = new_owner.get("full_name")
            if not new_owner_full_name:
                logging.error(f"New owner does not have a full_name field for email: {new_owner_email}")
                return jsonify({"message": "New owner does not have a full_name field"}), 400

            previous_owner = owners_collection.find_one({"car_id": ObjectId(car_id), "sale_price": None, "sold_date": None})
            if previous_owner:
                sale_price = new_owner_data.get("sale_price")
                if not sale_price:
                    logging.error("Sale price not provided")
                    return jsonify({"message": "Sale price not provided"}), 400

                sold_date = datetime.utcnow()
                owners_collection.update_one(
                    {"_id": previous_owner["_id"]},
                    {"$set": {"sale_price": sale_price, "sold_date": sold_date}}
                )
                logging.info(f"Updated previous owner with sale_price: {sale_price} and sold_date: {sold_date.strftime('%d/%m/%Y %H:%M:%S')}")

            new_owner_document = {
                "car_id": ObjectId(car_id),
                "owner_name": new_owner_full_name,
                "purchase_date": datetime.utcnow().strftime("%d/%m/%Y"),
                "sale_price": None,
                "sold_date": None,
                "created_at": datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S")
            }
            owners_collection.insert_one(new_owner_document)

            result = cars_collection.update_one(
                {"_id": ObjectId(car_id)},
                {"$set": {"current_owner": {"user_id": str(new_owner["_id"]), "username": new_owner["username"], "role": new_owner["role"]}}}
            )
            if result.modified_count > 0:
                return jsonify({"message": "Owner changed successfully."}), 200
            return jsonify({"message": "No changes made"}), 404

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while changing the owner."}), 500
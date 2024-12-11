from datetime import datetime
import logging
from bson import ObjectId
from flask import jsonify, request
from marshmallow import ValidationError
from ..services import dvla_service
from .owner_controller import OwnerController
from ..schemas.car_schema import CarSchema
from ..models import cars_collection, owners_collection, services_collection, users_collection

car_schema = CarSchema()

class CarController:
    @staticmethod
    def get_all_cars():
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            skip = (page - 1) * limit
            cars = cars_collection.find().skip(skip).limit(limit)
            cars_list = []
            for car in cars:
                car['_id'] = str(car['_id'])
                services = list(services_collection.find({"car_id": car['_id']}))
                for service in services:
                    service['_id'] = str(service['_id'])
                    service['car_id'] = str(service['car_id'])
                car['services'] = services
                cars_list.append(car)
            total_cars = cars_collection.count_documents({})

            return jsonify({
                "total": total_cars,
                "page": page,
                "limit": limit,
                "cars": cars_list
            }), 200

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while fetching the cars."}), 500

    @staticmethod
    def get_car(car_id):
        try:
            car_id = ObjectId(car_id) if not isinstance(car_id, ObjectId) else car_id
            car = cars_collection.find_one({"_id": car_id})
            if car:
                car['_id'] = str(car['_id'])

                # Fetch services
                services = list(services_collection.find({"car_id": car_id}))
                for service in services:
                    service['_id'] = str(service['_id'])
                    service['car_id'] = str(service['car_id'])
                    service['service_date'] = service['service_date'].strftime("%d/%m/%Y") if isinstance(service['service_date'], datetime) else service['service_date']
              
                services.sort(key=lambda x: datetime.strptime(x['service_date'], "%d/%m/%Y"), reverse=True)
                car['services'] = services

                # Fetch owners
                owners = list(owners_collection.find({"car_id": car_id}))
                for owner in owners:
                    owner['_id'] = str(owner['_id'])
                    owner['car_id'] = str(owner['car_id'])
                    owner['created_at'] = owner['created_at'].isoformat() if isinstance(owner['created_at'], datetime) else owner['created_at']
                    owner['purchase_date'] = owner['purchase_date'].isoformat() if isinstance(owner['purchase_date'], datetime) else owner['purchase_date']
                    owner['sold_date'] = owner['sold_date'].isoformat() if isinstance(owner['sold_date'], datetime) else owner['sold_date']
                car['owners'] = owners
                return jsonify(car), 200
            return jsonify({"message": "Car not found"}), 404
        
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while retrieving the car."}), 500
    
    @staticmethod
    def add_car(user_id, car_data):
        try:
            user_id = user_id.get("user_id") if isinstance(user_id, dict) else user_id
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404
            dvla_data = dvla_service.check_registration(car_data.get("registration_number"))
            if dvla_data[1] != 200:
                return jsonify({"message": "DVLA validation failed", "response": dvla_data[0]}), dvla_data[1]
            dvla_data = dvla_data[0]

            merged_data = {
                "make": car_data.get("make", dvla_data.get("make")),
                "price": car_data.get("price"),
                "registration_number": car_data.get("registration_number"),
                "title": car_data.get("title", f"{dvla_data.get('make')} {car_data.get('title', '')}".strip()),
                "mileage": car_data.get("mileage"),
                "fuel_type": car_data.get("fuel_type", dvla_data.get("fuelType")),
                "body_type": car_data.get("body_type", dvla_data.get("bodyType")),
                "engine": car_data.get("engine", dvla_data.get("engine")),
                "registration_year": car_data.get("registration_year", dvla_data.get("yearOfManufacture")),
                "doors": car_data.get("doors"),
                "seats": car_data.get("seats"),
                "emission_class": car_data.get("emission_class"),
                "colour": car_data.get("colour", dvla_data.get("colour")),
                "current_owner": {"user_id": user_id, "username": user.get("username"), "role": user.get("role")},
                "last_updated": datetime.utcnow(),
                "gearbox": car_data.get("gearbox")
            }

            result = cars_collection.insert_one(merged_data)
            car_id = str(result.inserted_id)

            purchase_date_str = car_data.get("purchase_date", datetime.utcnow().strftime("%Y-%m-%d"))
            if isinstance(purchase_date_str, str):
                try:
                    purchase_date = datetime.strptime(purchase_date_str, "%Y-%m-%d")
                except ValueError:
                    try:
                        purchase_date = datetime.strptime(purchase_date_str, "%d-%m-%Y")
                    except ValueError:
                        purchase_date = datetime.strptime(purchase_date_str, "%d/%m/%Y")
            else:
                purchase_date = purchase_date_str

            owner_data = {
                "car_id": car_id,
                "created_at": datetime.utcnow(),
                "owner_name": user.get("full_name"),
                "purchase_date": purchase_date.strftime("%d-%m-%Y"),
                "sale_price": None,
                "sold_date": None
            }

            owners_collection.insert_one(owner_data)

            return jsonify({"message": "Car added successfully", "car_id": car_id}), 201

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while adding the car."}), 500

    @staticmethod
    def update_car(user_id, car_id, car_data):
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

            dvla_data = dvla_service.check_registration(car_data.get("registration_number"))
            if dvla_data[1] != 200:
                return jsonify({"message": "DVLA validation failed", "response": dvla_data[0]}), dvla_data[1]
            dvla_data = dvla_data[0]

            updated_data = {
                "make": car_data.get("make", dvla_data.get("make")),
                "price": car_data.get("price"),
                "registration_number": car_data.get("registration_number"),
                "title": car_data.get("title", f"{dvla_data.get('make')} {car_data.get('title', '')}".strip()),
                "mileage": car_data.get("mileage"),
                "fuel_type": car_data.get("fuel_type", dvla_data.get("fuelType")),
                "body_type": car_data.get("body_type", dvla_data.get("bodyType")),
                "engine": car_data.get("engine", dvla_data.get("engine")),
                "registration_year": car_data.get("registration_year", dvla_data.get("yearOfManufacture")),
                "doors": car_data.get("doors"),
                "seats": car_data.get("seats"),
                "emission_class": car_data.get("emission_class"),
                "colour": car_data.get("colour", dvla_data.get("colour")),
                "last_updated": datetime.utcnow(),
                "gearbox": car_data.get("gearbox")
            }

            cars_collection.update_one({"_id": ObjectId(car_id)}, {"$set": updated_data})

            return jsonify({"message": "Car updated successfully"}), 200

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while updating the car."}), 500

    @staticmethod
    def delete_car(user_id, car_id):
        try:
            user_id = user_id.get("user_id") if isinstance(user_id, dict) else user_id
            logging.info(f"Extracted user_id: {user_id}")
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                logging.error(f"User not found for user_id: {user_id}")
                return jsonify({"message": "User not found"}), 404
            car = cars_collection.find_one({"_id": ObjectId(car_id)})
            if not car:
                logging.error(f"Car not found for car_id: {car_id}")
                return jsonify({"message": "Car not found"}), 404
            logging.info(f"Car current_owner: {car['current_owner']}")
            if car["current_owner"]["user_id"] != user_id and user.get("role") != "admin":
                logging.error(f"Permission denied for user_id: {user_id}")
                return jsonify({"message": "Permission denied"}), 403
            # Delete associated service records
            services_collection.delete_many({"car_id": ObjectId(car_id)})
            # Delete associated owner records
            owners_collection.delete_many({"car_id": ObjectId(car_id)})
            # Delete the car
            result = cars_collection.delete_one({"_id": ObjectId(car_id)})
            if result.deleted_count > 0:
                return jsonify({"message": "Car deleted successfully."}), 200
            return jsonify({"message": "Car not found"}), 404
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while deleting the car."}), 500

    
    @staticmethod
    def search_cars():
        try:
            query = request.args
            filters = {}

            if 'title' in query:
                filters['title'] = query['title']  # Exact match for title
            if 'price_min' in query and query['price_min'].isdigit():
                filters['price'] = {"$gte": float(query['price_min'])}
            if 'price_max' in query and query['price_max'].isdigit():
                filters.setdefault('price', {})["$lte"] = float(query['price_max'])
            if 'mileage_min' in query and query['mileage_min'].isdigit():
                filters['mileage'] = {"$gte": float(query['mileage_min'])}
            if 'mileage_max' in query and query['mileage_max'].isdigit():
                filters.setdefault('mileage', {})["$lte"] = float(query['mileage_max'])
            if 'registration_year_min' in query and query['registration_year_min'].isdigit():
                filters['registration_year'] = {"$gte": int(query['registration_year_min'])}
            if 'registration_year_max' in query and query['registration_year_max'].isdigit():
                filters.setdefault('registration_year', {})["$lte"] = int(query['registration_year_max'])
            if 'fuel_type' in query:
                filters['fuel_type'] = {"$regex": query['fuel_type'], "$options": "i"}
            if 'body_type' in query:
                filters['body_type'] = {"$regex": query['body_type'], "$options": "i"}
            if 'engine' in query:
                filters['engine'] = {"$regex": query['engine'], "$options": "i"}
            if 'gearbox' in query:
                filters['gearbox'] = {"$regex": query['gearbox'], "$options": "i"}
            if 'doors' in query and query['doors'].isdigit():
                filters['doors'] = int(query['doors'])
            if 'seats' in query and query['seats'].isdigit():
                filters['seats'] = int(query['seats'])
            if 'colour' in query:
                filters['colour'] = {"$regex": query['colour'], "$options": "i"}
            if 'emission_class' in query:
                filters['emission_class'] = {"$regex": query['emission_class'], "$options": "i"}
            if 'make' in query:
                filters['make'] = {"$regex": f"^{query['make']}$", "$options": "i"}

            page = query.get('page')
            limit = query.get('limit')
            if page is not None and page != 'null':
                page = int(page)
            else:
                page = None
            if limit is not None and limit != 'null':
                limit = int(limit)
            else:
                limit = None

            sort_field = query.get('sort_field', 'title')
            sort_order = int(query.get('sort_order', 1))

            cars_query = cars_collection.find(filters).sort(sort_field, sort_order)
            if page is not None and limit is not None:
                skip = (page - 1) * limit
                cars_query = cars_query.skip(skip).limit(limit)

            cars_list = []
            for car in cars_query:
                car['_id'] = str(car['_id'])
                for key, value in car.items():
                    if isinstance(value, ObjectId):
                        car[key] = str(value)
                cars_list.append(car)
            total_cars = cars_collection.count_documents(filters)

            return jsonify({
                "total": total_cars,
                "page": page,
                "limit": limit,
                "cars": cars_list
            }), 200

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while searching for cars."}), 500
    
    @staticmethod
    def get_my_cars(user_id):
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            skip = (page - 1) * limit
            user_id = user_id.get("user_id") if isinstance(user_id, dict) else str(user_id)
            cars = cars_collection.find({"current_owner.user_id": user_id}).skip(skip).limit(limit)
            cars_list = []
            for car in cars:
                car['_id'] = str(car['_id'])
                car['current_owner']['user_id'] = str(car['current_owner']['user_id'])
                cars_list.append(car)
            total_cars = cars_collection.count_documents({"current_owner.user_id": user_id})

            return jsonify({
                "total": total_cars,
                "page": page,
                "limit": limit,
                "cars": cars_list
            }), 200

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return jsonify({"message": "An error occurred while fetching the cars."}), 500

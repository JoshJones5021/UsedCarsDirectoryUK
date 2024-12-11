from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..controllers.car_controller import CarController

car_bp = Blueprint('car', __name__)

def generate_error_response(message, status_code):
    return jsonify({"error": message}), status_code

@car_bp.route('/api/cars', methods=['POST'])
@jwt_required()
def car_add():
    user_id = get_jwt_identity()
    return CarController.add_car(user_id, request.json)

@car_bp.route('/api/cars', methods=['GET'])
def car_get_all():
    return CarController.get_all_cars()

@car_bp.route('/api/cars/<car_id>', methods=['GET'])
def car_get(car_id):
    return CarController.get_car(car_id)

@car_bp.route('/api/cars/<car_id>', methods=['PUT'])
@jwt_required()
def car_update(car_id):
    user_id = get_jwt_identity()
    return CarController.update_car(user_id, car_id, request.json)

@car_bp.route('/api/cars/<car_id>', methods=['DELETE'])
@jwt_required()
def car_delete(car_id):
    user_id = get_jwt_identity()
    return CarController.delete_car(user_id, car_id)

@car_bp.route('/api/cars/search', methods=['GET'])
def car_search():
    return CarController.search_cars()

@car_bp.route('/api/cars/me', methods=['GET'])
@jwt_required()
def get_my_cars():
    user_id = get_jwt_identity()
    return CarController.get_my_cars(user_id)
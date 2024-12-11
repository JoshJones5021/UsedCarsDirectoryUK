from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..controllers.service_controller import ServiceController

service_bp = Blueprint('service', __name__)

@service_bp.route('/api/cars/<car_id>/services', methods=['POST'])
@jwt_required()
def add_service(car_id):
    user_id = get_jwt_identity()
    return ServiceController.add_service(car_id, user_id)

@service_bp.route('/api/cars/<car_id>/services', methods=['GET'])
def get_services(car_id):
    return ServiceController.get_all_services(car_id)

@service_bp.route('/api/cars/<car_id>/services/<service_id>', methods=['GET'])
def get_service(car_id, service_id):
    return ServiceController.get_service(car_id, service_id)

@service_bp.route('/api/cars/<car_id>/services/<service_id>', methods=['PUT'])
@jwt_required()
def update_service(car_id, service_id):
    user_id = get_jwt_identity()
    return ServiceController.update_service(car_id, service_id, user_id)

@service_bp.route('/api/cars/<car_id>/services/<service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(car_id, service_id):
    user_id = get_jwt_identity()
    return ServiceController.delete_service(car_id, service_id, user_id)
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..controllers.owner_controller import OwnerController

owner_bp = Blueprint('owner', __name__)

@owner_bp.route('/api/cars/<car_id>/owners', methods=['POST'])
@jwt_required()
def add_owner(car_id):
    owner_data = request.json
    user_identity = get_jwt_identity()
    user_id = user_identity['user_id'] if isinstance(user_identity, dict) else user_identity
    return OwnerController.add_owner(car_id, owner_data, user_id)

@owner_bp.route('/api/cars/<car_id>/owners', methods=['GET'])
def get_ownership_history(car_id):
    return OwnerController.get_ownership_history(car_id)

@owner_bp.route('/api/cars/<car_id>/owners/<owner_id>', methods=['GET'])
def get_owner(car_id, owner_id):
    return OwnerController.get_owner(car_id, owner_id)

@owner_bp.route('/api/cars/<car_id>/owners/<owner_id>', methods=['PUT'])
@jwt_required()
def update_owner(car_id, owner_id):
    user_id = get_jwt_identity()
    return OwnerController.update_owner(car_id, owner_id, user_id)

@owner_bp.route('/api/cars/<car_id>/owners/<owner_id>', methods=['DELETE'])
@jwt_required()
def delete_owner(car_id, owner_id):
    user_id = get_jwt_identity()
    return OwnerController.delete_owner(car_id, owner_id, user_id)

@owner_bp.route('/api/cars/<car_id>/change_owner', methods=['PUT'])
@jwt_required()
def change_owner(car_id):
    current_user = get_jwt_identity()
    new_owner_data = request.json
    return OwnerController.change_owner(car_id, current_user, new_owner_data)
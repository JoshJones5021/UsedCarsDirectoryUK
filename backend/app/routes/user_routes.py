from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..utils.token_blacklist import add_to_blacklist
from ..utils.auth import role_required, limiter
from ..controllers.user_controller import UserController

user_bp = Blueprint('user', __name__)

def generate_error_response(message, status_code):
    return jsonify({"error": message}), status_code

@user_bp.route('/api/admin/users', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def admin_get_all_users():
    return UserController.get_all_users()

@user_bp.route('/api/admin/users/<user_id>/role', methods=['PUT'])
@jwt_required()
@role_required(['admin'])
def admin_update_user_role(user_id):
    return UserController.update_user_role(user_id)

@user_bp.route('/api/users/register', methods=['POST'])
@limiter.limit("5 per minute")
def user_register():
    return UserController.register_user()

@user_bp.route('/api/users/login', methods=['POST'])
@limiter.limit("5 per minute")
def user_login():
    return UserController.login_user()

@user_bp.route('/api/users/logout', methods=['POST'])
@jwt_required()
def user_logout():
    jti = get_jwt()['jti']
    add_to_blacklist(jti)
    return jsonify({"message": "User logged out successfully."}), 200

@user_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def user_get_details():
    current_user = get_jwt_identity()
    return UserController.get_user_details(current_user)

@user_bp.route('/api/users/me', methods=['PUT'])
@jwt_required()
def user_update():
    current_user = get_jwt_identity()
    return UserController.update_user(current_user)

@user_bp.route('/api/users/me', methods=['DELETE'])
@jwt_required()
def user_delete():
    current_user = get_jwt_identity()
    jti = get_jwt()['jti']
    add_to_blacklist(jti)
    return UserController.delete_user(current_user)
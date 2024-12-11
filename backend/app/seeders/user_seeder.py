from mongoengine import connect
from app.models.user import User
from app.schemas.user_schema import UserSchema
from werkzeug.security import generate_password_hash
from datetime import datetime
import logging

class UserSeeder:
    def __init__(self, db_name):
        self.db_name = db_name

    def seed(self):
        # Connect to the database
        connect(self.db_name)

        # Define default users
        users = [
            {
                "_id": "6722e87a696c852cdd6f817e",
                "username": "Zgrant2002",
                "full_name": "Zoe Grant",
                "password": "password123",
                "email": "zoe@example.com",
                "role": "customer"
            },
            {
                "_id": "6723a840b4a363fd2f807c41",
                "username": "TestUser",
                "full_name": "Test User",
                "password": "password123",
                "email": "test@example.com",
                "role": "customer"
            },
            {
                "_id": "672152863afd7f24de200b62",
                "username": "Josh5021Jones",
                "full_name": "Josh Jones",
                "password": "password123",
                "email": "josh@example.com",
                "role": "customer"
            },
            {
                "username": "admin",
                "full_name": "Admin User",
                "password": "password123",
                "email": "admin@example.com",
                "role": "admin"
            },
            {
                "username": "customer",
                "full_name": "Customer User",
                "password": "password123",
                "email": "customer@example.com",
                "role": "customer"
            }
        ]

        for user_data in users:
            self.create_user(user_data)

    def create_user(self, user_data):
        try:
            # Validate user data using UserSchema
            user_schema = UserSchema()
            validated_data = user_schema.load(user_data)

            # Check if email or username already exists
            if User.objects(email=validated_data['email']).first() or User.objects(username=validated_data['username']).first():
                logging.info(f"User with email {validated_data['email']} or username {validated_data['username']} already exists.")
                return

            # Hash the password
            validated_data['password'] = generate_password_hash(validated_data['password'])

            # Get the current local time
            current_time = datetime.now()

            # Create the user
            user = User(
                id=validated_data.get('_id'),
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                full_name=validated_data['full_name'],
                role=validated_data['role'],
                created_at=current_time,
                last_updated=current_time
            )
            user.save()
            logging.info(f"User {user.username} created successfully.")
        except Exception as e:
            logging.error(f"Error creating user {user_data['username']}: {e}")

if __name__ == "__main__":
    seeder = UserSeeder("UsedCarsDirectoryUK")  # Replace with your database name
    seeder.seed()
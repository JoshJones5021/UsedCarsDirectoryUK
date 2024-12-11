from mongoengine import Document, StringField, DateTimeField

class User(Document):
    username = StringField(required=True, unique=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    full_name = StringField(required=True)
    role = StringField(required=True)
    created_at = DateTimeField(required=True)
    last_updated = DateTimeField(required=True)

    meta = {'collection': 'users'}
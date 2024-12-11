from mongoengine import Document, StringField, ReferenceField, DateTimeField
from .car import Car

class Service(Document):
    service_description = StringField(required=True)
    car_id = ReferenceField(Car, required=True)
    service_date = DateTimeField(required=True)
    created_at = DateTimeField(required=True)

    meta = {
        'collection': 'services',
        'indexes': [
            'service_date' 
        ]
    }

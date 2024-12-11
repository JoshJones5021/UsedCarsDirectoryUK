import datetime
from mongoengine import Document, StringField, ReferenceField, DateTimeField, FloatField
from .car import Car

class Owner(Document):
    owner_name = StringField(required=True)
    purchase_date = DateTimeField(required=True)
    sale_price = FloatField(required=False)
    sold_date = DateTimeField(required=False)
    car_id = ReferenceField(Car, required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'owners',
        'indexes': [
            'email',
            {'fields': ['name'], 'unique': False}
        ]
    }

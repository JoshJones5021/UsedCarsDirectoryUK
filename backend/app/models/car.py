from mongoengine import Document, StringField, IntField, FloatField, ValidationError

class Car(Document):
    make = StringField(required=True)
    price = FloatField(required=True, min_value=0)
    registration_number = StringField(required=True)
    title = StringField(required=True)
    mileage = FloatField(required=True)
    registration_year = IntField(required=True)
    fuel_type = StringField(required=True)
    engine = StringField(required=True)
    gearbox = StringField(required=True)
    doors = IntField(required=True)
    seats = IntField(required=True)
    colour = StringField(required=True)
    user_id = StringField(required=True)
    service_id = StringField(required=False)
    owner_id = StringField(required=False)

    meta = {
        'collection': 'cars',
        'indexes': [
            {'fields': ['title'], 'unique': False},
        ]
    }
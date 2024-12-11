from marshmallow import Schema, fields, validate

class CarSchema(Schema):
    _id = fields.Str(dump_only=True)
    make = fields.Str(required=True, validate=validate.Length(min=1))
    model = fields.Str(required=True, validate=validate.Length(min=1))
    year = fields.Int(required=True)
    colour = fields.Str(required=True, validate=validate.Length(min=1))
    mileage = fields.Int(required=True)
    price = fields.Float(required=True)
    current_owner = fields.Dict(required=True)
    services = fields.List(fields.Dict(), dump_only=True)
    owners = fields.List(fields.Dict(), dump_only=True)
    last_updated = fields.DateTime(dump_only=True)
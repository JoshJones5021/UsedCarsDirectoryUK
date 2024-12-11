from marshmallow import Schema, fields, validate

class OwnerSchema(Schema):
    owner_name = fields.Str(required=True, validate=validate.Length(min=1))
    purchase_date = fields.Date(required=True)
    sale_price = fields.Float(required=False, validate=validate.Range(min=0))
    sold_date = fields.Date(required=False)
    car_id = fields.Str(required=True)
    created_at = fields.DateTime(required=False)
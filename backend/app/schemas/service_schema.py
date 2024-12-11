from marshmallow import Schema, fields, validate

class ServiceSchema(Schema):
    service_date = fields.Date(required=True)
    service_description = fields.Str(required=True, validate=validate.Length(min=1))
    last_updated = fields.DateTime(required=False)
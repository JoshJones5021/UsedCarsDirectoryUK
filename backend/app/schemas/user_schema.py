from marshmallow import Schema, fields

class UserSchema(Schema):
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    full_name = fields.Str(required=True)
    role = fields.Str(required=True)
from flask import Flask

def register_blueprints(app: Flask):
    from .user_routes import user_bp
    from .car_routes import car_bp
    from .owner_routes import owner_bp
    from .service_routes import service_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(car_bp)
    app.register_blueprint(owner_bp)
    app.register_blueprint(service_bp)

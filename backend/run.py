from flask import Flask
from flask_cors import CORS
from app import create_app

app = create_app()
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})  # Enable CORS for specific routes and origins

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
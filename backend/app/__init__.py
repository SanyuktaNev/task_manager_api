from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS

# Import db from models
from app.models import db

# Initialize extensions
jwt = JWTManager()
migrate = Migrate()  # <-- create Migrate instance here

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)  # <-- now migrate is defined

    # Enable CORS for all routes
    CORS(app)

    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import task_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(task_bp, url_prefix="/api/v1/tasks")

    return app

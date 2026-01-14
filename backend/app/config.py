from datetime import timedelta

class Config:
    SECRET_KEY = "super-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "jwt-secret-key"
    
    # JWT Cookie Configuration
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_COOKIE_NAME = "access_token"
    JWT_COOKIE_SECURE = False      
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_COOKIE_SAMESITE = "Lax"  # ← ADDED: Critical for cross-origin
    JWT_COOKIE_DOMAIN = None      # ← ADDED: Allows localhost cookies
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
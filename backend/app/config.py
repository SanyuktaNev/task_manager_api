class Config:
    SECRET_KEY = "super-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "jwt-secret-key"

    
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_COOKIE_NAME = "access_token"
    JWT_COOKIE_SECURE = False      
    JWT_COOKIE_CSRF_PROTECT = False  

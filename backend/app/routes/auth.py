from flask import Blueprint, request, jsonify
from app.models import db, User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)

# --------- REGISTER ROUTE ----------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "Username already exists"}), 400

    user = User(
        username=data["username"],
        email=data.get("email", ""),  # optional email
        role=data.get("role", "user")  # default 'user'
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# --------- LOGIN ROUTE ----------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username and password are required"}), 400

    user = User.query.filter_by(username=data["username"]).first()
    if user and user.check_password(data["password"]):
        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify({"access_token": token}), 200

    return jsonify({"msg": "Invalid credentials"}), 401

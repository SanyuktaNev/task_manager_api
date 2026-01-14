from flask import Blueprint, request, jsonify, make_response
from app.models import db, User
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required, get_jwt_identity, get_jwt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "Username already exists"}), 400

    user = User(
        username=data["username"],
        email=data.get("email", ""), 
        role=data.get("role", "user")  
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        resp = make_response(jsonify({"msg": "Login successful"}))
        set_access_cookies(resp, access_token)
        return resp, 200

    return jsonify({"msg": "Invalid credentials"}), 401


@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"msg": "Logout successful"}))
    unset_jwt_cookies(response)
    return response, 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    claims = get_jwt()
    return jsonify({
        "user_id": get_jwt_identity(),
        "role": claims.get("role", "user")
    })
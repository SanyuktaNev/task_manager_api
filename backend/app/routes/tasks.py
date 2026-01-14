from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Task, User

task_bp = Blueprint("tasks", __name__)


@task_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())  
    claims = get_jwt()
    role = claims.get("role")

    if role == "admin":
        tasks = Task.query.all()  
    else:
        tasks = Task.query.filter_by(user_id=user_id).all()  

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "done": t.done,
            "user_id": t.user_id
        } for t in tasks
    ])



@task_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    if not data.get("title"):
        return jsonify({"msg": "Title is required"}), 400

    task = Task(
        title=data["title"],
        description=data.get("description", ""),
        user_id=user_id
    )
    db.session.add(task)
    db.session.commit()

    return jsonify({"msg": "Task created", "task_id": task.id}), 201



@task_bp.route("/<int:id>", methods=["PUT"])
@task_bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_task(id):
    data = request.get_json()
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get("role")

    task = Task.query.get_or_404(id)

    
    if task.user_id != user_id and role != "admin":
        return jsonify({"msg": "Forbidden"}), 403

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.done = data.get("done", task.done)

    db.session.commit()
    return jsonify({"msg": "Task updated"})


@task_bp.route("/<id>", methods=["DELETE"])
@task_bp.route("/<id>/", methods=["DELETE"])  
@jwt_required()
def delete_task(id):
    try:
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        role = claims.get("role")

        
        task = Task.query.get_or_404(id)

       
        if task.user_id != user_id and role != "admin":
            return jsonify({"msg": "Forbidden"}), 403

        db.session.delete(task)
        db.session.commit()

        return jsonify({"msg": "Task deleted"}), 200

    except Exception as e:
        return jsonify({"msg": "Error deleting task", "error": str(e)}), 500


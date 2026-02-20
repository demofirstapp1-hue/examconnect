from flask import Blueprint, request, jsonify, g
from supabase_client import supabase_admin
from auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard-stats", methods=["GET"])
@admin_required
def dashboard_stats():
    """Get platform-wide analytics."""
    try:
        users = supabase_admin.table("profiles").select("id, role").execute()
        exams = supabase_admin.table("exams").select("id, status").execute()
        answers = supabase_admin.table("answers").select("id").execute()

        user_data = users.data or []
        exam_data = exams.data or []

        stats = {
            "total_users": len(user_data),
            "total_teachers": len([u for u in user_data if u["role"] == "teacher"]),
            "total_students": len([u for u in user_data if u["role"] == "student"]),
            "total_exams": len(exam_data),
            "active_exams": len([e for e in exam_data if e["status"] == "active"]),
            "total_submissions": len(answers.data or []),
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    """List all users with optional role filter."""
    try:
        role_filter = request.args.get("role")
        query = supabase_admin.table("profiles").select("*").order("created_at", desc=True)
        if role_filter:
            query = query.eq("role", role_filter)
        result = query.execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users/<user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id):
    """Change a user's role."""
    try:
        data = request.get_json()
        new_role = data.get("role")
        if new_role not in ["admin", "teacher", "student"]:
            return jsonify({"error": "Invalid role"}), 400

        result = supabase_admin.table("profiles").update(
            {"role": new_role}
        ).eq("id", user_id).execute()

        # Also update user_metadata in Supabase Auth
        supabase_admin.auth.admin.update_user_by_id(
            user_id, {"user_metadata": {"role": new_role}}
        )

        return jsonify({"message": "Role updated", "data": result.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Remove a user from the platform."""
    try:
        if user_id == g.user_id:
            return jsonify({"error": "Cannot delete yourself"}), 400

        supabase_admin.table("profiles").delete().eq("id", user_id).execute()
        supabase_admin.auth.admin.delete_user(user_id)
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/exams", methods=["GET"])
@admin_required
def list_all_exams():
    """View all exams across the platform."""
    try:
        result = supabase_admin.table("exams").select(
            "*, profiles!exams_teacher_id_fkey(name, email)"
        ).order("created_at", desc=True).execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/exams/<exam_id>", methods=["DELETE"])
@admin_required
def delete_exam(exam_id):
    """Delete any exam."""
    try:
        supabase_admin.table("answers").delete().eq(
            "question_id",
            supabase_admin.table("questions").select("id").eq("exam_id", exam_id).execute()
        )
        supabase_admin.table("questions").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("exam_students").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("results").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("exams").delete().eq("id", exam_id).execute()
        return jsonify({"message": "Exam deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from supabase_client import supabase_admin
from auth_middleware import teacher_required

teacher_bp = Blueprint("teacher", __name__, url_prefix="/api/teacher")


@teacher_bp.route("/students", methods=["GET"])
@teacher_required
def list_students():
    """List all students in the system."""
    try:
        result = supabase_admin.table("profiles").select("*").eq(
            "role", "student"
        ).order("name").execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/students", methods=["POST"])
@teacher_required
def add_student():
    """Register a new student account."""
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password", "student123")

        # Create user in Supabase Auth
        auth_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"role": "student", "name": name}
        })

        user = auth_response.user

        # Create profile
        supabase_admin.table("profiles").insert({
            "id": user.id,
            "name": name,
            "email": email,
            "role": "student"
        }).execute()

        return jsonify({"message": "Student created", "id": user.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/students/<student_id>", methods=["DELETE"])
@teacher_required
def remove_student(student_id):
    """Remove a student."""
    try:
        supabase_admin.table("exam_students").delete().eq("student_id", student_id).execute()
        supabase_admin.table("profiles").delete().eq("id", student_id).execute()
        supabase_admin.auth.admin.delete_user(student_id)
        return jsonify({"message": "Student removed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Exams ────────────────────────────────────────────────────────────────────

@teacher_bp.route("/exams", methods=["GET"])
@teacher_required
def list_exams():
    """List exams created by this teacher."""
    try:
        result = supabase_admin.table("exams").select("*").eq(
            "teacher_id", g.user_id
        ).order("created_at", desc=True).execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams", methods=["POST"])
@teacher_required
def create_exam():
    """Create a new exam with schedule."""
    try:
        data = request.get_json()
        exam = {
            "title": data["title"],
            "description": data.get("description", ""),
            "teacher_id": g.user_id,
            "scheduled_start": data.get("scheduled_start"),
            "scheduled_end": data.get("scheduled_end"),
            "duration_minutes": data.get("duration_minutes", 60),
            "status": data.get("status", "draft"),
        }
        result = supabase_admin.table("exams").insert(exam).execute()

        # Assign students if provided
        student_ids = data.get("student_ids", [])
        if student_ids and result.data:
            exam_id = result.data[0]["id"]
            assignments = [{"exam_id": exam_id, "student_id": sid} for sid in student_ids]
            supabase_admin.table("exam_students").insert(assignments).execute()

        return jsonify(result.data[0] if result.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams/<exam_id>", methods=["PUT"])
@teacher_required
def update_exam(exam_id):
    """Update an exam."""
    try:
        data = request.get_json()
        allowed_fields = ["title", "description", "scheduled_start", "scheduled_end",
                          "duration_minutes", "status"]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        result = supabase_admin.table("exams").update(update_data).eq(
            "id", exam_id
        ).eq("teacher_id", g.user_id).execute()

        return jsonify(result.data[0] if result.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams/<exam_id>", methods=["DELETE"])
@teacher_required
def delete_exam(exam_id):
    """Delete an exam and its related data."""
    try:
        # Delete related data
        questions = supabase_admin.table("questions").select("id").eq("exam_id", exam_id).execute()
        q_ids = [q["id"] for q in (questions.data or [])]
        if q_ids:
            for qid in q_ids:
                supabase_admin.table("answers").delete().eq("question_id", qid).execute()
        supabase_admin.table("questions").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("exam_students").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("results").delete().eq("exam_id", exam_id).execute()
        supabase_admin.table("exams").delete().eq("id", exam_id).eq(
            "teacher_id", g.user_id
        ).execute()
        return jsonify({"message": "Exam deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams/<exam_id>/students", methods=["POST"])
@teacher_required
def assign_students(exam_id):
    """Assign students to an exam."""
    try:
        data = request.get_json()
        student_ids = data.get("student_ids", [])
        assignments = [{"exam_id": exam_id, "student_id": sid} for sid in student_ids]
        supabase_admin.table("exam_students").insert(assignments).execute()
        return jsonify({"message": f"{len(student_ids)} students assigned"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Questions ────────────────────────────────────────────────────────────────

@teacher_bp.route("/exams/<exam_id>/questions", methods=["GET"])
@teacher_required
def list_questions(exam_id):
    """List questions for an exam."""
    try:
        result = supabase_admin.table("questions").select("*").eq(
            "exam_id", exam_id
        ).order("order_index").execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams/<exam_id>/questions", methods=["POST"])
@teacher_required
def add_question(exam_id):
    """Add a question to an exam."""
    try:
        question_text = request.form.get("question_text", "")
        marks = request.form.get("marks", 10)
        order_index = request.form.get("order_index", 0)
        file_url = ""

        # Handle file upload
        if "question_file" in request.files:
            file = request.files["question_file"]
            if file.filename:
                filename = secure_filename(file.filename)
                filepath = f"questions/{exam_id}_{filename}"
                
                # Upload to Supabase Storage 'exam-files' bucket
                file_bytes = file.read()
                res = supabase_admin.storage.from_("exam-files").upload(filepath, file_bytes)
                
                # Get public URL
                file_url = supabase_admin.storage.from_("exam-files").get_public_url(filepath)

        question = {
            "exam_id": exam_id,
            "question_text": question_text,
            "question_file_url": file_url,
            "marks": int(marks),
            "order_index": int(order_index),
        }
        result = supabase_admin.table("questions").insert(question).execute()
        return jsonify(result.data[0] if result.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Answers & Marking ──────────────────────────────────────────────────────

@teacher_bp.route("/exams/<exam_id>/answers", methods=["GET"])
@teacher_required
def list_answers(exam_id):
    """View all submitted answers for an exam."""
    try:
        questions = supabase_admin.table("questions").select("id").eq(
            "exam_id", exam_id
        ).execute()
        q_ids = [q["id"] for q in (questions.data or [])]

        if not q_ids:
            return jsonify([]), 200

        all_answers = []
        for qid in q_ids:
            answers = supabase_admin.table("answers").select(
                "*, profiles!answers_student_id_fkey(name, email)"
            ).eq("question_id", qid).execute()
            all_answers.extend(answers.data or [])

        return jsonify(all_answers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/answers/<answer_id>/mark", methods=["PUT"])
@teacher_required
def mark_answer(answer_id):
    """Assign marks and feedback to an answer."""
    try:
        data = request.get_json()
        update = {
            "obtained_marks": data.get("obtained_marks"),
            "feedback": data.get("feedback", ""),
        }
        result = supabase_admin.table("answers").update(update).eq(
            "id", answer_id
        ).execute()
        return jsonify(result.data[0] if result.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Results ─────────────────────────────────────────────────────────────────

@teacher_bp.route("/exams/<exam_id>/results", methods=["GET"])
@teacher_required
def get_results(exam_id):
    """Get results for an exam."""
    try:
        result = supabase_admin.table("results").select(
            "*, profiles!results_student_id_fkey(name, email)"
        ).eq("exam_id", exam_id).execute()
        return jsonify(result.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@teacher_bp.route("/exams/<exam_id>/publish-results", methods=["POST"])
@teacher_required
def publish_results(exam_id):
    """Calculate and publish results for an exam."""
    try:
        # Get all questions
        questions = supabase_admin.table("questions").select("id, marks").eq(
            "exam_id", exam_id
        ).execute()
        q_data = questions.data or []
        total_marks = sum(q["marks"] for q in q_data)
        q_ids = [q["id"] for q in q_data]

        # Get all assigned students
        students = supabase_admin.table("exam_students").select("student_id").eq(
            "exam_id", exam_id
        ).execute()

        results = []
        for s in (students.data or []):
            student_id = s["student_id"]
            obtained = 0
            for qid in q_ids:
                ans = supabase_admin.table("answers").select("obtained_marks").eq(
                    "question_id", qid
                ).eq("student_id", student_id).execute()
                if ans.data:
                    obtained += (ans.data[0].get("obtained_marks") or 0)

            percentage = round((obtained / total_marks * 100), 2) if total_marks > 0 else 0

            # Upsert result
            result_data = {
                "exam_id": exam_id,
                "student_id": student_id,
                "total_marks": total_marks,
                "obtained_marks": obtained,
                "percentage": percentage,
                "published": True,
            }
            # Check if result exists
            existing = supabase_admin.table("results").select("id").eq(
                "exam_id", exam_id
            ).eq("student_id", student_id).execute()

            if existing.data:
                supabase_admin.table("results").update(result_data).eq(
                    "id", existing.data[0]["id"]
                ).execute()
            else:
                supabase_admin.table("results").insert(result_data).execute()

            results.append(result_data)

        # Update exam status
        supabase_admin.table("exams").update({"status": "completed"}).eq(
            "id", exam_id
        ).execute()

        return jsonify({"message": "Results published", "results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

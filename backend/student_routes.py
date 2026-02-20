import os
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from supabase_client import supabase_admin
from auth_middleware import student_required

student_bp = Blueprint("student", __name__, url_prefix="/api/student")


@student_bp.route("/exams", methods=["GET"])
@student_required
def list_exams():
    """List exams assigned to this student."""
    try:
        # Get exam IDs assigned to this student
        assignments = supabase_admin.table("exam_students").select("exam_id").eq(
            "student_id", g.user_id
        ).execute()
        exam_ids = [a["exam_id"] for a in (assignments.data or [])]

        if not exam_ids:
            return jsonify([]), 200

        exams = supabase_admin.table("exams").select(
            "*, profiles!exams_teacher_id_fkey(name)"
        ).in_("id", exam_ids).order("scheduled_start", desc=True).execute()

        return jsonify(exams.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route("/exams/<exam_id>/questions", methods=["GET"])
@student_required
def get_questions(exam_id):
    """View questions for an exam."""
    try:
        # Verify student is assigned to this exam
        assignment = supabase_admin.table("exam_students").select("id").eq(
            "exam_id", exam_id
        ).eq("student_id", g.user_id).execute()

        if not assignment.data:
            return jsonify({"error": "You are not assigned to this exam"}), 403

        # Check exam is active or scheduled
        exam = supabase_admin.table("exams").select("status").eq("id", exam_id).execute()
        if not exam.data:
            return jsonify({"error": "Exam not found"}), 404

        questions = supabase_admin.table("questions").select(
            "id, question_text, question_file_url, marks, order_index"
        ).eq("exam_id", exam_id).order("order_index").execute()

        return jsonify(questions.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route("/exams/<exam_id>/submit", methods=["POST"])
@student_required
def submit_answer(exam_id):
    """Upload answer sheet for a question."""
    try:
        question_id = request.form.get("question_id")
        if not question_id:
            return jsonify({"error": "question_id is required"}), 400

        # Verify assignment
        assignment = supabase_admin.table("exam_students").select("id").eq(
            "exam_id", exam_id
        ).eq("student_id", g.user_id).execute()

        if not assignment.data:
            return jsonify({"error": "You are not assigned to this exam"}), 403

        file_url = ""
        answer_text = request.form.get("answer_text", "")

        if "answer_file" in request.files:
            file = request.files["answer_file"]
            if file.filename:
                filename = secure_filename(file.filename)
                filepath = f"answers/{exam_id}_{g.user_id}_{filename}"
                
                # Upload to Supabase Storage 'exam-files' bucket
                file_bytes = file.read()
                res = supabase_admin.storage.from_("exam-files").upload(filepath, file_bytes)
                
                # Get public URL
                file_url = supabase_admin.storage.from_("exam-files").get_public_url(filepath)

        # Check if answer already exists (update it)
        existing = supabase_admin.table("answers").select("id").eq(
            "question_id", question_id
        ).eq("student_id", g.user_id).execute()

        answer_data = {
            "question_id": question_id,
            "student_id": g.user_id,
            "answer_file_url": file_url,
            "answer_text": answer_text,
        }

        if existing.data:
            result = supabase_admin.table("answers").update(answer_data).eq(
                "id", existing.data[0]["id"]
            ).execute()
        else:
            result = supabase_admin.table("answers").insert(answer_data).execute()

        return jsonify(result.data[0] if result.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route("/results", methods=["GET"])
@student_required
def view_results():
    """View published results for this student."""
    try:
        results = supabase_admin.table("results").select(
            "*, exams(title, description)"
        ).eq("student_id", g.user_id).eq("published", True).order(
            "exam_id", desc=True
        ).execute()
        return jsonify(results.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route("/exams/<exam_id>/my-answers", methods=["GET"])
@student_required
def my_answers(exam_id):
    """View own submitted answers for an exam."""
    try:
        questions = supabase_admin.table("questions").select("id").eq(
            "exam_id", exam_id
        ).execute()
        q_ids = [q["id"] for q in (questions.data or [])]

        if not q_ids:
            return jsonify([]), 200

        all_answers = []
        for qid in q_ids:
            ans = supabase_admin.table("answers").select("*").eq(
                "question_id", qid
            ).eq("student_id", g.user_id).execute()
            all_answers.extend(ans.data or [])

        return jsonify(all_answers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

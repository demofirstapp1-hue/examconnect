import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from admin_routes import admin_bp
from teacher_routes import teacher_bp
from student_routes import student_bp

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET", "dev-secret-key")

# Enable CORS for frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(student_bp)

@app.route("/api/health", methods=["GET"])
def health_check():
    return {"status": "ok", "message": "ExamConnect API is running"}, 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)

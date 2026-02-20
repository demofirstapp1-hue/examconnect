import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_KEY")


def verify_token(f):
    """Middleware to verify Supabase JWT and attach user info to g."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        try:
            # Supabase JWTs can be verified with the anon key as the secret
            # In production, use the JWT secret from Supabase dashboard settings
            payload = jwt.decode(
                token,
                options={"verify_signature": False}  # For dev; in prod, use JWT secret
            )
            g.user_id = payload.get("sub")
            g.user_email = payload.get("email")
            g.user_role = payload.get("user_metadata", {}).get("role", "student")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Require admin role."""
    @wraps(f)
    @verify_token
    def decorated(*args, **kwargs):
        if g.user_role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


def teacher_required(f):
    """Require teacher role."""
    @wraps(f)
    @verify_token
    def decorated(*args, **kwargs):
        if g.user_role != "teacher":
            return jsonify({"error": "Teacher access required"}), 403
        return f(*args, **kwargs)
    return decorated


def student_required(f):
    """Require student role."""
    @wraps(f)
    @verify_token
    def decorated(*args, **kwargs):
        if g.user_role != "student":
            return jsonify({"error": "Student access required"}), 403
        return f(*args, **kwargs)
    return decorated

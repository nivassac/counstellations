import os
import sqlite3
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "leads.db")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "fly2success2026")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                destination TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/admin")
def admin():
    return send_from_directory(BASE_DIR, "admin.html")


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    destination = (data.get("destination") or "").strip()

    if not all([name, email, phone, destination]):
        return jsonify({"error": "All fields are required."}), 400

    created_at = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO leads (name, email, phone, destination, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, email, phone, destination, created_at),
        )

    return jsonify({"message": "Thank you! We'll contact you within 24 hours."}), 201


@app.route("/api/leads", methods=["GET"])
def leads():
    password = request.headers.get("X-Admin-Password") or request.args.get("password")
    if password != ADMIN_PASSWORD:
        return jsonify({"error": "Unauthorized"}), 401

    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, name, email, phone, destination, created_at
            FROM leads
            ORDER BY id DESC
            """
        ).fetchall()

    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)

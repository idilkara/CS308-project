from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db import get_db_connection
import bcrypt

# Blueprint oluştur
company_bp = Blueprint("compnay", __name__)


@company_bp.route("/register", methods=["POST"])
def register():
    data = request.json 
    company_name = data["company_name"]
    company_address = data["company_address"]

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO companies (company_name, company_address) 
            VALUES (%s, %s)
        ''', (company_name, company_address))
        company_id = cur.fetchone()[0]
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.commit()
        cur.close()
        conn.close()
    return jsonify({"created company_id": company_id}), 201


@company_bp.route("/viewall", methods=["GET"])
def viewall():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM companies")
        companies = cur.fetchall()
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({"companies": companies}), 200


@company_bp.route("/view/<int:company_id>", methods=["GET"])
def view(company_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM companies WHERE company_id = %s", (company_id,))
        company = cur.fetchone()
    except Exception as e: 
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
    return jsonify({"company": company}), 200


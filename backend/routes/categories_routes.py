from flask import Blueprint, request, jsonify
from db import get_db_connection

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/categories", methods=["GET"])
def get_categories():

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories")
    categories = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"category_id": category[0], "name": category[1]}
        for category in categories
    ])



@categories_bp.route("/addcategory", methods=["POST"])
def add_category():


    data = request.get_json()
    category_name = data.get('name')

    if not category_name:
        return jsonify({"error": "Missing category name"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
        category_id = cursor.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Category added successfully", "category_id": category_id}), 201

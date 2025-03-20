from flask import Blueprint, request, jsonify
from db import get_db_connection

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # only return the categories where item exists to show. 
        cursor.execute("""
            SELECT c.category_id, c.name
            FROM categories c
            JOIN productcategories pc ON c.category_id = pc.category_id
            JOIN products p ON pc.product_id = p.product_id
            WHERE p.waiting = FALSE
            GROUP BY c.category_id
            HAVING COUNT(pc.product_id) > 0
        """)
        categories = cursor.fetchall()


        return jsonify([
            {"category_id": category[0], "name": category[1]}
            for category in categories
        ])

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



@categories_bp.route("/addcategory", methods=["POST"])
def add_category():

    data = request.get_json()
    category_name = data.get('name')

    if not category_name:
        return jsonify({"error": "Missing category name"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if the category already exists
        cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
        category_id = cursor.fetchone()
        if not category_id:

            # Insert the new category if it does not exist
            cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
            category_id = cursor.fetchone()[0]
            conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Category added successfully", "category_id": category_id}), 200

##
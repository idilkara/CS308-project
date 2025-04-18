from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log

authors_bp = Blueprint("authors", __name__)

# view order histor as a customer
@authors_bp.route("/authors", methods=["GET"])
def view_authors():


    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get all authors
        cur.execute("""
            SELECT author
            FROM products
            
        """)
        authors = cur.fetchall()
        if not authors:
            return jsonify({"message": "No authors found"}), 200
        author_list = []    

        for author in authors:
            author_list.append({
                "author": author[0],
            })
        return jsonify(author_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
# view order histor as a customer


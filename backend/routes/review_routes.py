# Users should be able to leave comments and give ratings on the products they purchased.
# Additionally, products must be delivered before a user can rate and comment.
# The ratings typically are between 1 and 5 stars or 1 and 10 points. 
# The comments should be approved by the product manager before they become visible. 
# However, ratings are submitted directly without any manager’s approval.
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

review_bp = Blueprint("review", __name__)

# Endpoint to submit a review (ratings are submitted directly, comments require approval)
@review_bp.route("/add", methods=["POST"])
@jwt_required()
def add_review():
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, dict):
            user_id = user_id.get("user_id")

        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 400

        data = request.get_json()
        product_id = data.get("product_id")
        rating = data.get("rating")
        comment = data.get("comment")

        if product_id is None or rating is None:
            return jsonify({"error": "'product_id' and 'rating' are required"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if product was purchased and delivered
        cur.execute("""
            SELECT oi.status FROM userorders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            WHERE o.user_id = %s AND oi.product_id = %s
        """, (user_id, product_id))

        result = cur.fetchone()
        if not result:
            return jsonify({"error": "You can only review products you have purchased."}), 403

        if result[0] != "delivered":
            return jsonify({"error": "You can only review products after they are delivered."}), 403

        # Insert review
        cur.execute("""
            INSERT INTO reviews (user_id, product_id, rating, comment, approved)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING review_id
        """, (user_id, product_id, rating, comment, False if comment else True))

        review_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Review submitted successfully!", "review_id": review_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Endpoint to fetch approved reviews for a product
@review_bp.route("/product/<int:product_id>", methods=["GET"])
def get_reviews(product_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT user_id, rating, comment FROM reviews 
            WHERE product_id = %s AND approved = TRUE
        """, (product_id,))

        reviews = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify([
            {"user_id": r[0], "rating": r[1], "comment": r[2]} for r in reviews
        ]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Endpoint for product managers to approve comments
@review_bp.route("/approve/<int:review_id>", methods=["PUT"])
@jwt_required()
def approve_review(review_id):
    try:
        user = get_jwt_identity()
        if isinstance(user, dict) and user.get("role") != "product_manager":
            return jsonify({"error": "Only product managers can approve comments."}), 403

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE reviews SET approved = TRUE WHERE review_id = %s", (review_id,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Review approved successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Endpoint for product managers to view unapproved comments
@review_bp.route("/unapproved", methods=["GET"])
@jwt_required()
def get_unapproved_reviews():
    try:
        user = get_jwt_identity()
        if isinstance(user, dict) and user.get("role") != "product_manager":
            return jsonify({"error": "Only product managers can view unapproved comments."}), 403

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT review_id, user_id, product_id, rating, comment 
            FROM reviews WHERE approved = FALSE
        """)

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify([
            {
                "review_id": r[0],
                "user_id": r[1],
                "product_id": r[2],
                "rating": r[3],
                "comment": r[4]
            } for r in rows
        ]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Users should be able to leave comments and give ratings on the products they purchased.
# Additionally, products must be delivered before a user can rate and comment.
# The ratings typically are between 1 and 5 stars or 1 and 10 points. 
# The comments should be approved by the product manager before they become visible. 
# However, ratings are submitted directly without any manager’s approval.


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

# Blueprint oluştur
review_bp = Blueprint("review", __name__)

@review_bp.route("/add", methods=["POST"])
@jwt_required()
def add_review():
    try:

        user = get_jwt_identity()
        user_id = user["user_id"] ## user_id = user (try)

        data = request.json
        product_id = data["product_id"]
        rating = data["rating"]
        comment = data.get("comment", None)  # Yorum zorunlu değil, None olabilir

        conn = get_db_connection()
        cur = conn.cursor()

        # Kullanıcının ürünü satın alıp almadığını ve teslim edilip edilmediğini kontrol et
        cur.execute("""
            SELECT o.status FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            WHERE o.user_id = %s AND oi.product_id = %s
        """, (user_id, product_id))
        
        order_status = cur.fetchone()

        if not order_status:
            return jsonify({"error": "You can only review products you have purchased."}), 403
        
        if order_status[0] != "delivered":
            return jsonify({"error": "You can only review products after they are delivered."}), 403

        # Yorumu ekle (yorum varsa onay bekler, puanlar direkt eklenir)
        cur.execute("""
            INSERT INTO reviews (user_id, product_id, rating, comment, approved)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, product_id, rating, comment, False if comment else True))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Review submitted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Onaylanmış yorumları listele (JWT gerekmez)
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

        reviews_list = [
            {"user_id": r[0], "rating": r[1], "comment": r[2]} for r in reviews
        ]

        return jsonify(reviews_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Yorum onaylama (Sadece "product_manager" rolü onaylayabilir)
@review_bp.route("/approve/<int:review_id>", methods=["PUT"])
@jwt_required()
def approve_review(review_id):
    try:
        user = get_jwt_identity() # try the same fix of /add route 
        if user["role"] != "product_manager":
            return jsonify({"error": "Only product managers can approve comments."}), 403

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("UPDATE reviews SET approved = TRUE WHERE review_id = %s", (review_id,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Review approved!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

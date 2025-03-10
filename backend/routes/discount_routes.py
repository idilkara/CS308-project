from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity

# Blueprint oluştur
discount_bp = Blueprint("discount", __name__)

### **Update Discount Information of a Product**
@discount_bp.route("/update_discount", methods=["POST"])
@jwt_required()
def update_discount():
    try:
        data = request.json
        product_id = data["product_id"]
        new_discount = data["discount"]

        if not (0 <= new_discount <= 1):
            return jsonify({"error": "Discount must be between 0 and 1"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the product exists
        cur.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        if product is None:
            return jsonify({"error": "Product not found"}), 404

        # Update the discount information
        cur.execute("UPDATE products SET discount = %s WHERE product_id = %s", (new_discount, product_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Discount updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
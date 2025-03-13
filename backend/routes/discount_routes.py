from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity

# Blueprint oluştur
discount_bp = Blueprint("discount", __name__)

### **Update Discount Information of a Product**
@discount_bp.route("/update_discount", methods=["POST"])
@jwt_required()
def update_discount():
    
    data = request.json
    product_id = data["product_id"]
    new_discount = data["discount"]

    if not (0 <= new_discount <= 1):
        return jsonify({"error": "Discount must be between 0 and 1"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        cur.execute("SELECT role FROM users WHERE user_id = %s", (get_jwt_identity(),))
        user_role = cur.fetchone()[0]
        if user_role != "sales_manager":
            raise ValueError("Unauthorized access")
    
            # Check if the product exists
        cur.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        if product is None:
            raise ValueError( "Product not found" )
        
        cur.execute("SELECT sales_manager FROM products WHERE product_id = %s", (product_id,))
        product_sales_manager = cur.fetchone()[0]
        if product_sales_manager != get_jwt_identity():
            raise ValueError("Unauthorized access")
    

        # Update the discount information
        cur.execute("UPDATE products SET discount = %s WHERE product_id = %s", (new_discount, product_id))
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    else:
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Discount updated successfully!"}), 200

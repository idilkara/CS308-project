


# During order processing, an order history page
# should allow the user to view the status as: processing, in-transit, and delivered.

# view orders by userID

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

order_bp = Blueprint("order", __name__)

# view order histor as a customer
@order_bp.route("/view_order_history", methods=["GET"])
@jwt_required()
def view_orders():
    
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get all orders for the user
        cur.execute("""
            SELECT o.order_id, o.order_date, o.total_price, o.status, oi.product_id,  oi.quantity, oi.price
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            WHERE o.user_id = %s
            ORDER BY o.order_date DESC
        """, (user_id,))

        orders = cur.fetchall()

        if not orders:
            return jsonify({"message": "No orders found"}), 200

        order_list = []
        current_order = None
        for order in orders:
            if current_order is None or current_order["order_id"] != order[0]:
                if current_order is not None:
                    order_list.append(current_order)
                current_order = {
                    "order_id": order[0],
                    "order_date": order[1],
                    "total_price": order[2],
                    "status": order[3],
                    "items": []
                }
            current_order["items"].append({
                "product_id": order[4],
                "quantity": order[5],
                "price": order[6]
            })
        if current_order is not None:
            order_list.append(current_order)

        return jsonify(order_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    finally:
        conn.close()    
        cur.close()

    
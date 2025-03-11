
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

pm_delivery_bp = Blueprint("pm_delivery", __name__)


# view all orders for product manager
@pm_delivery_bp.route("/view_orders", methods=["GET"])
@jwt_required()
def view_orders():
    try:
        user_info = get_jwt_identity()
        user_id = user_info["user_id"]
        user_role = user_info["role"]

        if user_role != "product_manager":
            return jsonify({"error": "Unauthorized access"}), 403

        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch all orders
        cur.execute("""
            SELECT o.order_id, o.user_id, o.order_date, o.total_price, o.status, 
                   oi.product_id, oi.quantity, oi.price, p.name, p.model
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE p.product_manager = %s
        """, (user_id,))
        orders = cur.fetchall()

        cur.close()
        conn.close()

        orders_list = []
        for order in orders:
            order_dict = {
                "order_id": order[0],
                "user_id": order[1],
                "order_date": order[2],
                "total_price": order[3],
                "status": order[4],
                "product_id": order[5],
                "quantity": order[6],
                "price": order[7],
                "product_name": order[8],
                "product_model": order[9]
            }
            orders_list.append(order_dict)

        return jsonify(orders_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    


@pm_delivery_bp.route("/update_status", methods=["POST"])
@jwt_required()
def update_status():
    try:
        data = request.json
        order_id = data["order_id"]
        new_status = data["status"]

        if new_status not in ["processing", "in-transit", "delivered"]:
            return jsonify({"error": "Invalid status"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Update the status of the order
        cur.execute("UPDATE orders SET status = %s WHERE order_id = %s", (new_status, order_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Order status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

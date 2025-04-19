

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

sm_orders_bp = Blueprint("sm_orders", __name__)


# View all orders for sales manager
@sm_orders_bp.route("/view_orders", methods=["GET"])
@jwt_required()
def view_orders():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    try:

        cur.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        user_role = cur.fetchone()[0]       
        if user_role != "sales_manager":
            raise ValueError("Unauthorized access")
        
        # Fetch all orders related to the sales manager's products
        cur.execute("""
            SELECT u.userid, o.delivery_address , o.order_id, o.order_date, o.status, p.product_id, op.quantity, op.price, p.name, p.model
            FROM userorders o users u  products p orderitems op
            WHERE o.order_id = op.order_id AND op.product_id = p.product_id AND p.sales_manager = %s
        """, (user_id,))
        orders = cur.fetchall()



        cur.close()
        conn.close()

        orders_list = []
        for order in orders:
            order_dict = {
                "user_id": order[0],
                "delivery_address": order[1],
                "userorder_id": order[2],
                "order_date": order[3],
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

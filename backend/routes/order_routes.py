


# During order processing, an order history page
# should allow the user to view the status as: processing, in-transit, and delivered.

# view orders by userID

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log

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
            SELECT o.order_id, o.order_date, o.total_price, o.status, oi.product_id,  oi.quantity, oi.price, orderitem_id
            FROM userorders o
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
                "price": order[6],
                "orderitem_id": order[7],
            })
        if current_order is not None:
            order_list.append(current_order)

        return jsonify(order_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    finally:
        conn.close()    
        cur.close()

    
#view orderitem by oorderitem id


# orderitem_id SERIAL PRIMARY KEY,
#     order_id INT,
#     product_id INT,
#     quantity INT NOT NULL,
#     price DECIMAL(10,2) NOT NULL, --final price --if discount was applied it affected it already
#     status VARCHAR(50) CHECK (s
                              

@order_bp.route("/view_orderitem/<int:orderitem_id>", methods=["GET"])
@jwt_required()
def view_orderitem(orderitem_id):
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Fetch the specific order item for the user
        cur.execute("""
            SELECT oi.orderitem_id, oi.product_id, oi.quantity, oi.price, 
                   o.order_id, o.order_date, oi.status
            FROM orderitems oi
            JOIN userorders o ON oi.order_id = o.order_id
            WHERE o.user_id = %s AND oi.orderitem_id = %s
        """, (user_id, orderitem_id))

        order_item = cur.fetchone()

        if not order_item:
            log.warning(f"Order item {orderitem_id} not found")
            return jsonify({"message": "Order item not found"}), 404

        # Construct the response
        order_item_details = {
            "orderitem_id": order_item[0],
            "product_id": order_item[1],
            "quantity": order_item[2],
            "price": order_item[3],
            "order_id": order_item[4],
            "order_date": order_item[5],
          
            "status": order_item[6]
        }

        return jsonify(order_item_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
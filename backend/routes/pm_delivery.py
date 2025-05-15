
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection


# The product manager is also in the role of delivery department since it controls the stock. 
# This means, the product manager shall view the invoices, 
# products to be delivered, and the corresponding addresses for delivery. 
# A delivery list has the following properties: delivery ID, customer ID, product ID, quantity, total price, delivery address, and a field showing whether the delivery has been completed or not. 
# The product manager can also update the status of an order. 
# Last but not least, the product managers shall approve or disapprove the comments. 
# the order for delivery processing should be forwarded to the delivery department, 
# which will process the order for shipping.

pm_delivery_bp = Blueprint("pm_delivery", __name__)

# View all orders for product manager
@pm_delivery_bp.route("/view_orders", methods=["GET"])
@jwt_required()
def view_orders():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the user is a product manager
        cur.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        user_role = cur.fetchone()[0]
        if user_role != "product_manager":
            return jsonify({"error": "Unauthorized access"}), 403

        # Fetch all orders related to the product manager's products
        cur.execute("""
            SELECT o.order_id, o.order_date, o.total_price, o.status, 
                   oi.product_id, oi.quantity, oi.price, oi.orderitem_id,
                   p.name, p.model, o.delivery_address, oi.status
            FROM userorders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE p.product_manager = %s
            ORDER BY o.order_date DESC
        """, (user_id,))

        orders = cur.fetchall()

        if not orders:
            return jsonify({"message": "No orders found"}), 200

        # Group orders and format the response
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
                    "delivery_address": order[10],
                    "items": []
                }
            current_order["items"].append({
                "product_id": order[4],
                "quantity": order[5],
                "price": order[6],
                "orderitem_id": order[7],
                "product_name": order[8],
                "product_model": order[9],
                "orderitem_status": order[11]  # Assuming this is the status of the order item
            })
        if current_order is not None:
            order_list.append(current_order)

        return jsonify(order_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

    finally:
        cur.close()
        conn.close()
    
@pm_delivery_bp.route("/update_status/<int:orderproduct_id>", methods=["PUT"])
@jwt_required()
def update_status(orderproduct_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "status" not in data:
        return jsonify({"error": "Missing status field"}), 400

    new_status = data["status"]
    if new_status not in ["processing", "in-transit", "delivered"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Verify user role
        cur.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        result = cur.fetchone()
        if not result or result[0] != "product_manager":
            return jsonify({"error": "Unauthorized access"}), 403

        # Verify if the product manager owns this order item
        cur.execute("""
            SELECT p.product_manager 
            FROM products p 
            JOIN orderitems oi ON p.product_id = oi.product_id 
            WHERE p.product_manager = %s AND oi.orderitem_id = %s
        """, (user_id, orderproduct_id))

        if not cur.fetchone():
            return jsonify({"error": "Unauthorized access"}), 403
        
        #check if the order not cancelled
        cur.execute("SELECT status FROM orderitems WHERE orderitem_id = %s", (orderproduct_id,))
        order_status = cur.fetchone()[0]
        if order_status == "cancelled":
            return jsonify({"error": "Order is already cancelled"}), 400

        # Update the order item status
        cur.execute("""
            UPDATE orderitems 
            SET status = %s 
            WHERE orderitem_id = %s 
            RETURNING order_id;
        """, (new_status, orderproduct_id))
        
        updated_order_id = cur.fetchone()
        if not updated_order_id:
            return jsonify({"error": "Failed to update order"}), 500
        updated_order_id = updated_order_id[0]

        # Check the overall order status
        cur.execute("SELECT status FROM orderitems WHERE order_id = %s", (updated_order_id,))
        order_status = [status[0] for status in cur.fetchall()]

        # Determine new status for userorders
        if "processing" not in order_status and "delivered" not in order_status:
            cur.execute("UPDATE userorders SET status = 'in-transit' WHERE order_id = %s", (updated_order_id,))
        elif "processing" not in order_status and "in-transit" not in order_status:
            cur.execute("UPDATE userorders SET status = 'delivered' WHERE order_id = %s", (updated_order_id,))

        conn.commit()
        return jsonify({"message": "Order status updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

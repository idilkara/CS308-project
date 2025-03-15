
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

        cur.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        user_role = cur.fetchone()[0]       
        if user_role != "product_manager":
            raise ValueError("Unauthorized access")
        
        # Fetch all orders related to the product manager's products
        cur.execute("""
            SELECT u.user_id, o.delivery_address, o.order_id, o.order_date, o.status, p.product_id, op.quantity, op.price, p.name, p.model
            FROM userorders o
            JOIN users u ON o.user_id = u.user_id  -- Join users table on user_id
            JOIN orderitems op ON o.order_id = op.order_id  -- Join orderitems table on order_id
            JOIN products p ON op.product_id = p.product_id  -- Join products table on product_id
            WHERE p.product_manager = %s  -- Filter by the product_manager

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

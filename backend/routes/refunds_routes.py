from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta


# A customer shall also be able to selectively return a product and ask for a refund. 
# In such a case, the customer will select an already purchased product from his/her order history within 30 days of purchase, 
# provided the product has been delivered. 
# 
# The sales manager will evaluate the refund request and upon receiving the product back to the store will authorize the refund. 
# If a refund is approved, the product will be added back to stock, and the customer must be notified—ideally via email—of the approval and refunded amount. 
# Moreover, if the product was bought during a discount campaign and the customer chooses to return the product after the campaign ends, 
# the refunded amount will be the same as the time of its purchase with the discount applied.

# IMPLEMENT EDILCEKLER: 
    # request return product given order id , product id 
    # accept return request  (update status)
    # reject return request     (update status)
    # get requests for sales manager 


# Blueprint oluştur
refunds_bp = Blueprint("refunds", __name__)

### **Request Return Product**
@refunds_bp.route("/request_return", methods=["POST"])
@jwt_required()
def request_return():
    try:
        data = request.json
        user_id = get_jwt_identity()["user_id"]
        order_id = data["order_id"]
        product_id = data["product_id"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the order exists and belongs to the user
        cur.execute("SELECT order_date, status FROM userorders WHERE order_id = %s AND user_id = %s", (order_id, user_id))
        order = cur.fetchone()
        if order is None:
            return jsonify({"error": "Order not found"}), 404

        order_date, status = order
        if status != 'delivered':
            return jsonify({"error": "Product has not been delivered yet"}), 400

        # Check if the return request is within 30 days of purchase
        if datetime.now() > order_date + timedelta(days=30):
            return jsonify({"error": "Return request is beyond the 30-day return period"}), 400

        # Check if the product is in the order
        cur.execute("SELECT quantity, price FROM orderitems WHERE order_id = %s AND product_id = %s", (order_id, product_id))
        order_item = cur.fetchone()
        if order_item is None:
            return jsonify({"error": "Product not found in order"}), 404

        quantity, price = order_item

        # Insert return request
        cur.execute("INSERT INTO return_requests (order_id, product_id, user_id, quantity, price, request_date) VALUES (%s, %s, %s, %s, %s, %s)",
                    (order_id, product_id, user_id, quantity, price, datetime.now()))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Return request submitted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

### **Accept Return Request**
@refunds_bp.route("/accept_return", methods=["POST"])
@jwt_required()
def accept_return():
    try:
        data = request.json
        return_request_id = data["return_request_id"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the return request exists
        cur.execute("SELECT order_id, product_id, quantity, price FROM return_requests WHERE return_request_id = %s", (return_request_id,))
        return_request = cur.fetchone()
        if return_request is None:
            return jsonify({"error": "Return request not found"}), 404

        order_id, product_id, quantity, price = return_request

        # Update product stock
        cur.execute("UPDATE products SET stock_quantity = stock_quantity + %s WHERE product_id = %s", (quantity, product_id))

        # Update order status to refunded
        cur.execute("UPDATE refunds SET status = 'refunded' WHERE orderitem_id = %s", (order_id,))

        # Delete the return request
        cur.execute("DELETE FROM return_requests WHERE return_request_id = %s", (return_request_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Return request accepted and product added back to stock!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400




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
        # Get all orders for the user and also get refund status
        cur.execute("""
            SELECT o.order_id, o.order_date, o.total_price, o.status, 
                oi.product_id, oi.quantity, oi.price, oi.orderitem_id,
                p.name, p.author, p.distributor_information, oi.status, o.delivery_address,
                r.status as refund_status
            FROM userorders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            LEFT JOIN refunds r ON oi.orderitem_id = r.orderitem_id
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
                    "items": [],
                    "delivery_address": order[12]  # Assuming this is the delivery address
                }
            current_order["items"].append({
                "product_id": order[4],
                "quantity": order[5],
                "price": order[6],
                "orderitem_id": order[7],
                "name": order[8], 
                "author": order[9],  
                "distributor": order[10], 
                "orderitem_status": order[11]  ,
                "refund_status": order[13]
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




#The user sends the products and quantities in his/her cart.
#The stock of the products is checked.
#The order is created (user orders)
#Order items are added (orderitems)
#Stock is reduced (products.stock_quantity)
#Order status = starts as 'processing'.
@order_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate JSON structure
    if not data or "items" not in data or "delivery_address" not in data:
        return jsonify({"error": "Request must include 'items' and 'delivery_address'"}), 400

    items = data["items"]
    delivery_address = data["delivery_address"]

    # Validate each item
    if not isinstance(items, list) or not all("product_id" in i and "quantity" in i for i in items):
        return jsonify({"error": "Each item must include 'product_id' and 'quantity'"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        total_price = 0

        # Validate stock availability and calculate total price
        for item in items:
            cur.execute("SELECT price, stock_quantity FROM products WHERE product_id = %s", (item['product_id'],))
            result = cur.fetchone()
            if not result:
                return jsonify({"error": f"Product {item['product_id']} not found"}), 404
            price, stock_quantity = result
            if stock_quantity < item['quantity']:
                return jsonify({"error": f"Insufficient stock for product {item['product_id']}"}), 400
            total_price += float(price) * item['quantity']

        # Insert order into userorders table with delivery_address
        cur.execute("""
            INSERT INTO userorders (user_id, order_date, total_price, delivery_address, status)
            VALUES (%s, CURRENT_TIMESTAMP, %s, %s, 'processing')
            RETURNING order_id
        """, (user_id, total_price, delivery_address))
        order_id = cur.fetchone()[0]

        # Insert order items and update stock
        for item in items:
            cur.execute("SELECT price FROM products WHERE product_id = %s", (item['product_id'],))
            unit_price = cur.fetchone()[0]

            cur.execute("""
                INSERT INTO orderitems (order_id, product_id, quantity, price, status)
                VALUES (%s, %s, %s, %s, 'processing')
            """, (order_id, item['product_id'], item['quantity'], unit_price))

            cur.execute("""
                UPDATE products
                SET stock_quantity = stock_quantity - %s
                WHERE product_id = %s
            """, (item['quantity'], item['product_id']))

        conn.commit()
        return jsonify({"message": "Order placed successfully", "order_id": order_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Order failed: {str(e)}"}), 500

    finally:
        cur.close()
        conn.close()


#cancel order

@order_bp.route("/cancel_order/<int:order_id>", methods=["POST"])
@jwt_required()
def cancel_order(order_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the order belongs to the user
        cur.execute("SELECT user_id FROM userorders WHERE order_id = %s", (order_id,))
        order = cur.fetchone()
        if not order or order[0] != user_id:
            return jsonify({"error": "Order not found or unauthorized"}), 403
        
        # Check if the order is in the processing state
        cur.execute("SELECT status FROM userorders WHERE order_id = %s", (order_id,))
        status = cur.fetchone()[0]
        if status != 'processing':
            return jsonify({"error": "Order is not in the processing state"}), 400
        
        # Update the order status to cancelled
        cur.execute("UPDATE userorders SET status = 'cancelled' WHERE order_id = %s", (order_id,))


        #update the overall order status to cancelled if all orderitems in the order are cancelled 
        #check if all orderitems are cancelled
     
        cur.execute("SELECT status FROM orderitems WHERE order_id = %s", (order_id,))
        order_status = [status[0] for status in cur.fetchall()]

        # Determine new status for userorders
        if "processing" not in order_status and "delivered" not in order_status and "in-transit" not in order_status :
            log.info("All orderitems are cancelled, updating order status to cancelled")
            cur.execute("UPDATE userorders SET status = 'cancelled' WHERE order_id = %s", (order_id,))


        #increment the stock of the product - orderitem is cancelled
        # get product id of the orderitem
        cur.execute("SELECT product_id FROM orderitems WHERE order_id = %s", (order_id,))
        product_id = cur.fetchone()[0]
        # increment the stock of the product
        cur.execute("UPDATE products SET stock_quantity = stock_quantity + %s WHERE product_id = %s", (1, product_id))


        conn.commit()
        return jsonify({"message": "Order cancelled successfully"}), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Order cancellation failed: {str(e)}"}), 500
    



#cancel orderitem
@order_bp.route("/cancel_orderitem/<int:orderitem_id>", methods=["POST"])
@jwt_required()
def cancel_orderitem(orderitem_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the order item belongs to an order that belongs to the user
        cur.execute("""
            SELECT o.user_id 
            FROM orderitems oi
            JOIN userorders o ON oi.order_id = o.order_id
            WHERE oi.orderitem_id = %s
        """, (orderitem_id,))
        order = cur.fetchone()
        if not order or int(order[0]) != int(user_id):
            return jsonify({"error": "Order item not found or unauthorized"}), 403

        # Check if the order item is in the processing state
        cur.execute("SELECT status FROM orderitems WHERE orderitem_id = %s", (orderitem_id,))
        status = cur.fetchone()[0]
        if status != 'processing':
            return jsonify({"error": "Order item is not in the processing state"}), 400
        
        # Update the order item status to cancelled
        cur.execute("UPDATE orderitems SET status = 'cancelled' WHERE orderitem_id = %s", (orderitem_id,))
        # Get order_id and product_id for the cancelled orderitem
        cur.execute("""
            SELECT order_id, product_id 
            FROM orderitems 
            WHERE orderitem_id = %s
        """, (orderitem_id,))
        result = cur.fetchone()
        order_id, product_id = result

        # Check if all orderitems in this order are cancelled
        cur.execute("SELECT status FROM orderitems WHERE order_id = %s", (order_id,))
        order_status = [status[0] for status in cur.fetchall()]

        # Update order status to cancelled if all items are cancelled
        if "processing" not in order_status and "delivered" not in order_status and "in-transit" not in order_status:
            log.info("All orderitems are cancelled, updating order status to cancelled")
            cur.execute("UPDATE userorders SET status = 'cancelled' WHERE order_id = %s", (order_id,))

        # Increment the stock quantity for the cancelled item
        cur.execute("UPDATE products SET stock_quantity = stock_quantity + %s WHERE product_id = %s", (1, product_id))


        conn.commit()
        return jsonify({"message": "Order item cancelled successfully"}), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Order item cancellation failed: {str(e)}"}), 500
    

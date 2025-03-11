

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

#4. They, however, should login before placing an order and making a payment.
#  Upon logging in, any products previously added to their cart should be retained.
#  Once payment is made and confirmed by the (mock-up) banking entity, 
# an invoice must be shown on the screen and 
# a PDF copy of the invoice should be emailed to the user.


# A customer should enter his/her credit card information to purchase a product. 
# Credit card verification and limit issues are out of scope of the project.


## create a order , add the products in cart to the order and remove the products from the cart
## stock should decrease after the order is created 



payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/create_order", methods=["POST"])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

        conn = get_db_connection()
        cur = conn.cursor()

        # Get all items in the user's shopping cart
        cur.execute("""
            SELECT p.product_id, p.name, p.price, scp.quantity, p.stock_quantity
            FROM shoppingcart sc
            JOIN shoppingcartproducts scp ON sc.cart_id = scp.cart_id
            JOIN products p ON scp.product_id = p.product_id
            WHERE sc.user_id = %s
        """, (user_id,))
        cart_items = cur.fetchall()

        if not cart_items:
            cur.close()
            conn.close()
            return jsonify({"error": "Cart is empty"}), 400

        total_price = sum(item[2] * item[3] for item in cart_items)

        # Create order
        cur.execute("INSERT INTO orders (user_id, total_price) VALUES (%s, %s) RETURNING order_id", (user_id, total_price))
        order_id = cur.fetchone()[0]

        # Add items to order and decrease stock quantity
        for item in cart_items:
            product_id = item[0]
            quantity = item[3]
            stock_quantity = item[4]

            if stock_quantity < quantity:
                cur.close()
                conn.close()
                return jsonify({"error": f"Not enough stock for product {item[1]}"}), 400

            cur.execute("INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)", 
                        (order_id, product_id, quantity, item[2]))

            # Decrease the stock quantity
            new_stock_quantity = stock_quantity - quantity
            cur.execute("UPDATE products SET stock_quantity = %s WHERE product_id = %s", (new_stock_quantity, product_id))

        # Clear the shopping cart
        cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = (SELECT cart_id FROM shoppingcart WHERE user_id = %s)", (user_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Order created successfully", "order_id": order_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
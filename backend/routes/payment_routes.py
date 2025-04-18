

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log

#4. They, however, should login before placing an order and making a payment.
#  Upon logging in, any products previously added to their cart should be retained.
#  Once payment is made and confirmed by the (mock-up) banking entity, 
# an invoice must be shown on the screen and 
# a PDF copy of the invoice should be emailed to the user.

# todo pdf gondermece 
# A customer should enter his/her credit card information to purchase a product. 
# Credit card verification and limit issues are out of scope of the project.

# create a order, add the products in cart to the order and remove the products from the cart
# stock should decrease after the order is created 
# When the shopping is done, that product should be decreased from the stock and 


payment_bp = Blueprint("payment", __name__)

# buy everything in the cart
# create order and remove the products from the cart
@payment_bp.route("/create_order", methods=["POST"])
@jwt_required()
def create_order():

    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get the user's delivery address
        cur.execute("""
            SELECT home_address FROM users WHERE user_id = %s
        """, (user_id,))
        delivery_address = cur.fetchone()[0]

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
            raise ValueError("Cart is empty")


        #check if user have home address and payment method set

        cur.execute("""
            SELECT home_address, payment_method FROM users WHERE user_id = %s
        """, (user_id,))
        user_info = cur.fetchone()
        if not user_info or not user_info[0] or not user_info[1]:
            raise ValueError("User does not have a delibery address or payment method set")

        total_price = sum(item[2] * item[3] for item in cart_items)

        # Create user order
        cur.execute("INSERT INTO userorders (user_id, total_price, delivery_address) VALUES (%s, %s, %s) RETURNING order_id", (user_id, total_price, delivery_address))
        userorder_id = cur.fetchone()[0]

        # Add items to order and decrease stock quantity
        for item in cart_items:
            product_id = item[0]
            price = item[2] # TODO : price might change based on discounts
            quantity = item[3]
            stock_quantity = item[4]

            cur.execute("SELECT discount_amount from discounts where product_id = %s", (product_id,))
            discount_amount = cur.fetchone()    
            if discount_amount:
                price = price - price * discount_amount[0]

            if stock_quantity < quantity:
                raise ValueError(f"Not enough stock for product {item[1]}")

            # Decrease the stock quantity
            new_stock_quantity = stock_quantity - quantity
            cur.execute("UPDATE products SET stock_quantity = %s WHERE product_id = %s", (new_stock_quantity, product_id))
            cur.execute("INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)", (userorder_id, product_id, quantity, price))

        # Empty the shopping cart
        cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = (SELECT cart_id FROM shoppingcart WHERE user_id = %s)", (user_id,))

    except Exception as e:
        conn.rollback()
        log.error(f"Error occurred while creating order: {str(e)}")
        return jsonify({"error": str(e)}), 400
    else:
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Order created successfully", "order_id": userorder_id}), 200



from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

shopping_bp = Blueprint("shopping", __name__)

@shopping_bp.route("/view", methods=["GET"])
@jwt_required()
def view_cart():
    try:
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

        conn = get_db_connection()
        cur = conn.cursor()

        # Get all items in the user's shopping cart
        cur.execute("""
            SELECT p.product_id, p.name, p.description, p.price, scp.quantity 
            FROM shoppingcart sc
            JOIN shoppingcartproducts scp ON sc.cart_id = scp.cart_id
            JOIN products p ON scp.product_id = p.product_id
            WHERE sc.user_id = %s
        """, (user_id,))
        cart_items = cur.fetchall()

        cur.close()
        conn.close()

        if not cart_items:
            return jsonify({"message": "Shopping cart is empty"}), 200

        cart_list = [
            {
                "product_id": item[0],
                "name": item[1],
                "description": item[2],
                "price": item[3],
                "quantity": item[4]
            }
            for item in cart_items
        ]

        return jsonify(cart_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@shopping_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    try:
        data = request.json
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
        product_id = data["product_id"]
        quantity = data["quantity"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the product exists
        cur.execute("SELECT stock_quantity FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        if product is None:
            return jsonify({"error": "Product not found"}), 404

        # Check if the product is in stock
        stock_quantity = product[0]
        if stock_quantity < quantity:
            return jsonify({"error": "Not enough stock available"}), 400

        # Get the user's cart ID
        cur.execute("SELECT cart_id FROM shoppingcart WHERE user_id = %s", (user_id,))
        cart = cur.fetchone()
        if cart is None:
            # return jsonify({"error": "Shopping cart not found"}), 404

            #create a new cart for the user
            cur.execute("INSERT INTO shoppingcart (user_id) VALUES (%s) RETURNING cart_id", (user_id,))
            cart = cur.fetchone()       
        cart_id = cart[0]
        

        # Check if the user already has this product in their cart
        cur.execute("SELECT quantity FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        cart_item = cur.fetchone()

        if cart_item:
            # Update the quantity if the product is already in the cart
            new_quantity = cart_item[0] + quantity
            cur.execute("UPDATE shoppingcartproducts SET quantity = %s WHERE cart_id = %s AND product_id = %s", (new_quantity, cart_id, product_id))
        else:
            # Add the product to the cart if it's not already there
            cur.execute("INSERT INTO shoppingcartproducts (cart_id, product_id, quantity) VALUES (%s, %s, %s)", (cart_id, product_id, quantity))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product added to cart successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@shopping_bp.route("/remove", methods=["POST"])
@jwt_required()
def remove_from_cart():
    try:
        data = request.json
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
        product_id = data["product_id"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Get the user's cart ID
        cur.execute("SELECT cart_id FROM shoppingcart WHERE user_id = %s", (user_id,))
        cart = cur.fetchone()
        if cart is None:
            return jsonify({"error": "Shopping cart not found"}), 404
        cart_id = cart[0]

        # Check if the product is in the user's cart
        cur.execute("SELECT quantity FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        cart_item = cur.fetchone()

        if cart_item is None:
            return jsonify({"error": "Product not found in cart"}), 404

        # Remove the product from the cart
        cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product removed from cart successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
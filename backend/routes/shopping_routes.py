from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
import smtplib
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from db import get_db_connection
import logging
import base64


#login yapmadan shopping cart a ekleme ve sonra login ile shopping cart i saklama yapilcak 
# -frontendde yapilsin bu login gerceklesince cart temizlenmesin

shopping_bp = Blueprint("shopping", __name__)

# SHOPPING CART FUNCTIONS 

@shopping_bp.route("/view", methods=["GET"])
@jwt_required()
def view_cart():
    
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get all items in the user's shopping cart
        cur.execute("""
            SELECT p.product_id, p.name, p.description, p.price, scp.quantity 
            FROM shoppingcart sc
            JOIN shoppingcartproducts scp ON sc.cart_id = scp.cart_id
            JOIN products p ON scp.product_id = p.product_id
            WHERE sc.user_id = %s
        """, (user_id,))
        cart_items = cur.fetchall()

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
    
    finally:
        cur.close()
        conn.close()

    
# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@shopping_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    logger.debug("Received request to add product to cart.")
    data = request.json
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    product_id = data["product_id"]
    quantity = data["quantity"]

    logger.debug(f"Received request to add product {product_id} with quantity {quantity} to user {user_id}'s cart.")
    logger.debug(f"User ID: {user_id}, Product ID: {product_id}, Quantity: {quantity}")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if the product exists and has enough quantity
        logger.debug(f"Checking stock for product_id {product_id}.")
        cur.execute("SELECT stock_quantity FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        
        if product is None:
            logger.error(f"Product with ID {product_id} does not exist.")
            return jsonify({"error": "Product not found"}), 404

        stock_quantity = product[0]
        logger.debug(f"Product stock for {product_id}: {stock_quantity}.")

        if stock_quantity < quantity:
            logger.warning(f"Not enough stock for product_id {product_id}. Requested: {quantity}, Available: {stock_quantity}.")
            return jsonify({"error": "Not enough stock available"}), 400

        # Get the user's cart ID
        logger.debug(f"Checking if user {user_id} has an existing cart.")
        cur.execute("SELECT cart_id FROM shoppingcart WHERE user_id = %s", (user_id,))
        cart = cur.fetchone()
        
        cart_id = cart[0]
        logger.debug(f"Using cart_id {cart_id} for user {user_id}.")

        # Check if the product already exists in the cart
        logger.debug(f"Checking if product {product_id} is already in the cart.")
        cur.execute("SELECT quantity FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        cart_item = cur.fetchone()

        if cart_item:
            # Update the quantity if the product is already in the cart
            new_quantity = cart_item[0] + quantity
            logger.debug(f"Product {product_id} already in cart, updating quantity to {new_quantity}.")
            cur.execute("UPDATE shoppingcartproducts SET quantity = %s WHERE cart_id = %s AND product_id = %s", (new_quantity, cart_id, product_id))
        else:
            # Add the product to the cart if it's not already there
            logger.debug(f"Adding product {product_id} to the cart with quantity {quantity}.")
            cur.execute("INSERT INTO shoppingcartproducts (cart_id, product_id, quantity) VALUES (%s, %s, %s)", (cart_id, product_id, quantity))

    except Exception as e:
        conn.rollback()
        logger.error(f"Error occurred while adding product {product_id} to cart: {str(e)}")
        return jsonify({"error": str(e)}), 400
    else:
        conn.commit()
        logger.debug(f"Product {product_id} successfully added to cart {cart_id}.")
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Product added to cart successfully!"}), 200

@shopping_bp.route("/remove", methods=["POST"])
@jwt_required()
def remove_from_cart():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON data"}), 400

    if "product_id" not in data or "quantity" not in data:
        return jsonify({"error": "Missing required fields: product_id, quantity"}), 400

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    product_id = data["product_id"]
    quantity = data["quantity"]

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get the user's cart ID
        cur.execute("SELECT cart_id FROM shoppingcart WHERE user_id = %s", (user_id,))
        cart = cur.fetchone()

        if cart is None:
            return jsonify({"error": "Cart not found for user"}), 404

        cart_id = cart[0]

        # Get the current quantity in cart
        cur.execute("SELECT quantity FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        result = cur.fetchone()

        if result is None:
            return jsonify({"error": "Product not found in cart"}), 404

        quantity_in_cart = result[0]

        # Remove or update product in the cart
        if quantity_in_cart <= quantity:
            cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        else:
            new_quantity = quantity_in_cart - quantity
            cur.execute("UPDATE shoppingcartproducts SET quantity = %s WHERE cart_id = %s AND product_id = %s", (new_quantity, cart_id, product_id))

        conn.commit()
        return jsonify({"message": "Product removed from cart successfully!"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@shopping_bp.route("/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():
    
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get the user's cart ID

        cur.execute("SELECT cart_id FROM shoppingcart WHERE user_id = %s", (user_id,))
        cart = cur.fetchone()
        cart_id = cart[0]

        # Clear all products from the user's cart
        cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = %s", (cart_id,))

    except Exception as e:
        conn.rollback()             
        return jsonify({"error": str(e)}), 400
    else:
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Shopping cart cleared successfully!"}), 200





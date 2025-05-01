from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log

discounts_bp = Blueprint('discounts', __name__)

#set discount to product ID
@discounts_bp.route('/setdiscount', methods=['PUT'])
@jwt_required()
def get_discounts():

    # Get the current user's identity
    current_user = get_jwt_identity()
    user_id = current_user['user_id']

    # Get the request data
    data = request.get_json()
    product_id = data.get('product_id')
    discount_amount = data.get('discount_amount')

    if not product_id or not discount_amount:
        return jsonify({'error': 'Product ID and discount are required'}), 400

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if the user is an admin of the produce
    cursor.execute('SELECT sales_manager FROM products WHERE product_id = ?', (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    if product[0] != user_id:
        return jsonify({'error': 'You are not authorized to set discounts for this product'}), 403
    
    try:
        # Update the discount for the product in the database
        cursor.execute("INSERT INTO discounts (product_id, discount_amount) VALUES (?, ?)", (product_id, discount_amount))
        conn.commit()

        # Notify users who have the product in their wishlist
        user_ids = getUsersToBeNotified(product_id)
        for user_id in user_ids:
            addToUserNotifications(user_id, product_id, discount_amount)
        # Log the notification
        log.info(f"Discount of {discount_amount} added to product {product_id} for user {user_id}")
        # Return a success response
        return jsonify({'message': 'Discount updated successfully'}), 200

    except Exception as e:
        log.error(f"Error updating discount: {e}")
        return jsonify({'error': 'Failed to update discount'}), 500

    finally:
        cursor.close()
        conn.close()       


@discounts_bp.route('/getdiscount/<int:product_id>', methods=['GET'])
def get_discount(product_id):
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch the discount for the product from the database
        cursor.execute("SELECT discount_amount FROM discounts WHERE product_id = ?", (product_id,))
        discount = cursor.fetchone()
        if discount:
            return discount[0]
        else:
            return None

    except Exception as e:
        log.error(f"Error fetching discount: {e}")
        return None

    finally:
        cursor.close()
        conn.close()

def addToUserNotifications(user_id, product_id, discount_amount):
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Add the notification to the user's notifications table
        cursor.execute("INSERT INTO user_notifications (user_id, product_id, message) VALUES (?, ?, ?)", (user_id, product_id, f"Discount of {discount_amount} added to product {product_id}"))
        conn.commit()

    except Exception as e:
        log.error(f"Error adding notification: {e}")

    finally:
        cursor.close()
        conn.close()

def getUsersToBeNotified(product_id):
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT w.user_id
            FROM wishlists w
            JOIN wishlistproducts wp ON w.wishlist_id = wp.wishlist_id
            WHERE wp.product_id = %s
        """, (product_id,))

        users = cursor.fetchall()
        user_ids = [user[0] for user in users]
        return user_ids

    except Exception as e:
        log.error(f"Error fetching users to be notified: {e}")
        return []

    finally:
        cursor.close()
        conn.close()
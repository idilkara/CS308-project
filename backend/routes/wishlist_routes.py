from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity

# Blueprint oluştur
wishlist_bp = Blueprint("wishlist", __name__)

@wishlist_bp.route("/view", methods=["GET"])
@jwt_required()
def view_wishlist():
    try:
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

        conn = get_db_connection()
        cur = conn.cursor()

        # Get all items in the user's wishlist
        cur.execute("""
            SELECT p.product_id, p.name, p.description, p.price 
            FROM wishlists w
            JOIN wishlistproducts wp ON w.wishlist_id = wp.wishlist_id
            JOIN products p ON wp.product_id = p.product_id
            WHERE w.user_id = %s
        """, (user_id,))
        wishlist_items = cur.fetchall()

        cur.close()
        conn.close()

        if not wishlist_items:
            return jsonify({"message": "Wishlist is empty"}), 200

        wishlist_list = [
            {
                "product_id": item[0],
                "name": item[1],
                "description": item[2],
                "price": item[3]
            }
            for item in wishlist_items
        ]

        return jsonify(wishlist_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@wishlist_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_wishlist():
    try:
        data = request.json
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
        product_id = data["product_id"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the product exists
        cur.execute("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        product = cur.fetchone()
        if product is None:
            return jsonify({"error": "Product not found"}), 404

        # Get the user's wishlist ID
        cur.execute("SELECT wishlist_id FROM wishlists WHERE user_id = %s", (user_id,))
        wishlist = cur.fetchone()
        if wishlist is None:
            # Create a new wishlist for the user
            cur.execute("INSERT INTO wishlists (user_id) VALUES (%s) RETURNING wishlist_id", (user_id,))
            wishlist = cur.fetchone()
        wishlist_id = wishlist[0]

        # Check if the user already has this product in their wishlist
        cur.execute("SELECT product_id FROM wishlistproducts WHERE wishlist_id = %s AND product_id = %s", (wishlist_id, product_id))
        wishlist_item = cur.fetchone()

        if wishlist_item:
            return jsonify({"message": "Product already in wishlist"}), 200
        else:
            # Add the product to the wishlist
            cur.execute("INSERT INTO wishlistproducts (wishlist_id, product_id) VALUES (%s, %s)", (wishlist_id, product_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product added to wishlist successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@wishlist_bp.route("/remove", methods=["POST"])
@jwt_required()
def remove_from_wishlist():
    try:
        data = request.json
        user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
        product_id = data["product_id"]

        conn = get_db_connection()
        cur = conn.cursor()

        # Get the user's wishlist ID
        cur.execute("SELECT wishlist_id FROM wishlists WHERE user_id = %s", (user_id,))
        wishlist = cur.fetchone()
        if wishlist is None:
            return jsonify({"error": "Wishlist not found"}), 404
        wishlist_id = wishlist[0]

        # Check if the product is in the user's wishlist
        cur.execute("SELECT product_id FROM wishlistproducts WHERE wishlist_id = %s AND product_id = %s", (wishlist_id, product_id))
        wishlist_item = cur.fetchone()

        if wishlist_item is None:
            return jsonify({"error": "Product not found in wishlist"}), 404

        # Remove the product from the wishlist
        cur.execute("DELETE FROM wishlistproducts WHERE wishlist_id = %s AND product_id = %s", (wishlist_id, product_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product removed from wishlist successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
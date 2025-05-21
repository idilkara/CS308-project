from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity

# Blueprint oluştur
wishlist_bp = Blueprint("wishlist", __name__)

@wishlist_bp.route("/view", methods=["GET"])
@jwt_required()
def view_wishlist():

    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get all items in the user's wishlist
        cur.execute("""
            SELECT p.product_id, p.name, p.description, p.price , p.author , p.distributor_information , p.stock_quantity,d.discount_amount
            FROM wishlists w
            JOIN wishlistproducts wp ON w.wishlist_id = wp.wishlist_id
            JOIN products p ON wp.product_id = p.product_id
            JOIN discounts d ON d.product_id = p.product_id
            WHERE w.user_id = %s
        """, (user_id,))
        wishlist_items = cur.fetchall()

        cur.close()
        conn.close()

        if not wishlist_items:
            return jsonify({"message": "Wishlist is empty"}), 200

        #based on any information this can change
        wishlist_list = [
            {
                "product_id": item[0],
                "name": item[1],
                "description": item[2],
                "price": item[3],
                "author": item[4],
                "distributor_information": item[5],
                "stock_quantity": item[6],
                "discount_rate":item[7],
            }
            for item in wishlist_items
        ]
        return jsonify(wishlist_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@wishlist_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_wishlist():

    data = request.json
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    product_id = data["product_id"]


    conn = get_db_connection()
    cur = conn.cursor()

    try: 
        
        # Get the user's wishlist ID
        cur.execute("SELECT wishlist_id FROM wishlists WHERE user_id = %s", (user_id,))
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

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    
    finally:
        conn.commit()
        cur.close()
        conn.close()

    return jsonify({"message": "Product added to wishlist successfully!"}), 200

   

@wishlist_bp.route("/remove", methods=["POST"])
@jwt_required()
def remove_from_wishlist():

    data = request.json
    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    product_id = data["product_id"]

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get the user's wishlist ID
        cur.execute("SELECT wishlist_id FROM wishlists WHERE user_id = %s", (user_id,)) 
        wishlist = cur.fetchone()

        wishlist_id = wishlist[0]

        # Check if the product is in the user's wishlist
        cur.execute("SELECT product_id FROM wishlistproducts WHERE wishlist_id = %s AND product_id = %s", (wishlist_id, product_id))
        wishlist_item = cur.fetchone()

        # Remove the product from the wishlist
        cur.execute("DELETE FROM wishlistproducts WHERE wishlist_id = %s AND product_id = %s", (wishlist_id, product_id))

    except Exception as e:

        conn.rollback()
        return jsonify({"error": str(e)}), 400
    
    finally:
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Product removed from wishlist successfully!"}), 200

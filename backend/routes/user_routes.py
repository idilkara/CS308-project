from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity
import bcrypt

import logging
user_bp = Blueprint("user", __name__)

# A customer has the following properties at the very least: 
# ID, name, e-mail address, home address, and password. 
# The customer should be able to view their name, email address, 
# and delivery address on a profile page.

# Return user info based on userID
# view user info The customer should be able to view their name, email address, and delivery address on a profile page.
@user_bp.route("/userinfo", methods=["GET"])
@jwt_required()
def user_info():
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT user_id, name, email, home_address, role FROM Users WHERE user_id = %s', (user_id,))
        user = cur.fetchone()

        cur.close()
        conn.close()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        user_info = {
            "user_id": user[0],
            "name": user[1],
            "email": user[2],
            "home_address": user[3],
            "role": user[4]
        }

        return jsonify(user_info), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# get payment method
@user_bp.route("/payment_method", methods=["GET"])
@jwt_required()
def get_payment_method():
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT payment_method FROM Users WHERE user_id = %s', (user_id,))
        payment_method = cur.fetchone()

        cur.close()
        conn.close()

        if payment_method is None:
            return jsonify({"error": "Payment method not found"}), 404

        return jsonify({"payment_method": payment_method[0]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
# change payment method
@user_bp.route("/change_payment_method", methods=["PUT"])
@jwt_required() 
def change_payment_method():
    user_id = get_jwt_identity()
    new_payment_method = request.json.get("new_payment_method")

    if not new_payment_method:
        return jsonify({"error": "New payment method is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('UPDATE Users SET payment_method = %s WHERE user_id = %s', (new_payment_method, user_id))

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.commit()
        cur.close()
        conn.close()

    return jsonify({"message": "Payment method updated successfully!"}), 200



# Edit user home address
@user_bp.route("/edit_address", methods=["PUT"])
@jwt_required()
def edit_home_address():
    
    user_id = get_jwt_identity()
    new_address = request.json.get("home_address")

    if not new_address:
        return jsonify({"error": "New home address is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('UPDATE Users SET home_address = %s WHERE user_id = %s', (new_address, user_id))

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.commit()
        cur.close()
        conn.close()

    return jsonify({"message": "Home address updated successfully!"}), 200

    
# USER UPDATE PASSWORD
@user_bp.route("/update_password", methods=["PUT"])
@jwt_required()
def update_password():

    user_id = get_jwt_identity()
    new_password = request.json.get("password")

    if not new_password:
        return jsonify({"error": "New password is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()


    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    try:
        cur.execute('UPDATE Users SET password = %s WHERE user_id = %s', (hashed_password.decode("utf-8"), user_id))
        
        print(f"User inserted successfully with ID: {user_id}")
    except Exception as e:
        logging.logger.error(f"Error occurred: {str(e)}")
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.commit()
        cur.close()
        conn.close()

    return jsonify({"message": "Password updated successfully!"}), 200


from flask import Blueprint, request, jsonify
import psycopg2
import os

user_bp = Blueprint("user", __name__)


# A customer has the following properties at the very least: 
# ID, name, e-mail address, home address, and password. 
# The customer should be able to view their name, email address, 
# and delivery address on a profile page.

# Database connection function
def get_db_connection():
    return psycopg2.connect(
        host="db",
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD')
    )

# Add user
@user_bp.route("/add", methods=["POST"])
def add_user():
    try:
        data = request.json
        name = data["name"]
        email = data["email"]
        password = data["password"]
        home_address = data.get("home_address", "")
        role = data["role"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('''
            INSERT INTO Users (name, email, password, home_address, role) 
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, email, password, home_address, role))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "User added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Show all users
@user_bp.route("/show", methods=["GET"])
def show_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT * FROM Users')
        users = cur.fetchall()

        cur.close()
        conn.close()

        users_list = [
            {
                "user_id": user[0],
                "name": user[1],
                "email": user[2],
                "password": user[3],
                "home_address": user[4],
                "role": user[5]
            }
            for user in users
        ]

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Delete a user
@user_bp.route("/delete/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('DELETE FROM Users WHERE user_id = %s', (user_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": f"User with user_id {user_id} deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

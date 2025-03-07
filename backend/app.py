from flask import Flask, request, jsonify
import psycopg2
import os

app = Flask(__name__)

# Connect to PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        host="db",
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD')
    )

# Add user route
@app.route("/add-user", methods=["POST"])
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

        # Insert user into the database
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

# Show users route
@app.route("/show-users", methods=["GET"])
def show_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Query all users
        cur.execute('SELECT * FROM Users')
        users = cur.fetchall()

        cur.close()
        conn.close()

        # Format the result into a list of dictionaries
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

# Delete user route
@app.route("/delete-user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Delete user from the database
        cur.execute('DELETE FROM Users WHERE user_id = %s', (user_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": f"User with user_id {user_id} deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db import get_db_connection
import bcrypt

# Blueprint oluştur
auth_bp = Blueprint("auth", __name__)



### **1. Kullanıcı Kayıt Endpoint’i**
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    print("Received registration data:", data)  # Debugging
    # TODO role issue with compatibility for frontend
    try:
        name = data["name"]
        email = data["email"]
        password = data["password"]
        role = data["role"]  
        home_address = data.get("home_address", None)
        print(f"Extracted data - Name: {name}, Email: {email}, Role: {role}")

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        print("Password hashed successfully.")
    except KeyError as e:
        print(f"Missing required field: {e}")  # Debugging
        return jsonify({"error": f"Missing required field: {e}"}), 400  
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Insert user into the database
        cur.execute('''
            INSERT INTO users (name, email, password, role) 
            VALUES (%s, %s, %s, %s) RETURNING user_id
        ''', (name, email, hashed_password.decode("utf-8"), role))
        user_id = cur.fetchone()[0]
        print(f"User inserted successfully with ID: {user_id}")

        if role == "customer":
            # Create shopping cart and wishlist
            cur.execute('''INSERT INTO shoppingcart (user_id) VALUES (%s)''', (user_id,))
            cur.execute('''INSERT INTO wishlists (user_id) VALUES (%s)''', (user_id,))
            print("Shopping cart and wishlist created.")


            if home_address:
                cur.execute('''UPDATE users SET home_address = %s WHERE user_id = %s''', (home_address, user_id))
                print("Home address updated.")

        elif role in ["product_manager", "sales_manager"]:
            # if "company_id" not in data:
            #     raise ValueError("company_id is required for managers.")
            # company_id = data["company_id"]
            cur.execute('''INSERT INTO companymanagers (user_id) VALUES (%s)''', (user_id,))
            # print(f"User assigned to company ID: {company_id}")
        
        conn.commit()
        print("Transaction committed successfully.")

    except Exception as e:
        conn.rollback()
        print("Error occurred, transaction rolled back:", str(e))
        return jsonify({"error": str(e)}), 400  
    
    finally:
        cur.close()
        conn.close()
        print("Database connection closed.")

    return jsonify({"message": "User registered successfully!"}), 201



### **2. Kullanıcı Girişi (Login)**
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT user_id, password FROM Users WHERE email = %s', (email,))
        user = cur.fetchone()

        if user and bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            access_token = create_access_token(identity=str(user[0]))  # Ensure user_id is a string
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400
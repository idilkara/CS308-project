from flask import Blueprint, request, jsonify
import psycopg2
import os
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

# Blueprint oluştur
auth_bp = Blueprint("auth", __name__)

# PostgreSQL Connection
def get_db_connection():
    return psycopg2.connect(
        host="db",  
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD')
    )

### **1. Kullanıcı Kayıt Endpoint’i**
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data["name"]
        email = data["email"]
        password = data["password"]
        home_address = data.get("home_address", "")
        role = data["role"]  

        # Şifreyi hashle
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('''
            INSERT INTO Users (name, email, password, home_address, role) 
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, email, hashed_password.decode("utf-8"), home_address, role))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

### **2. Kullanıcı Girişi (Login)**
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT user_id, name, email, password, role FROM Users WHERE email = %s", (email,))
        user = cur.fetchone()

        cur.close()
        conn.close()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        user_id, name, email, hashed_password, role = user

        if not bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8")):
            return jsonify({"error": "Invalid credentials"}), 401

        # JWT Token Oluştur
        access_token = create_access_token(identity={"user_id": user_id, "role": role})

        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

### **3. JWT Korumalı Route**
@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": "Protected data", "user": current_user}), 200

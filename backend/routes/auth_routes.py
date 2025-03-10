from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db import get_db_connection
import bcrypt

# Blueprint oluştur
auth_bp = Blueprint("auth", __name__)

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

        # Kullanıcıyı home_address olmadan ekleyelim
        cur.execute('''
            INSERT INTO Users (name, email, password, role) 
            VALUES (%s, %s, %s, %s)
        ''', (name, email, hashed_password.decode("utf-8"), role))

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

        cur.execute('SELECT user_id, password FROM Users WHERE email = %s', (email,))
        user = cur.fetchone()

        if user and bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            access_token = create_access_token(identity=str(user[0]))  # Ensure user_id is a string
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400
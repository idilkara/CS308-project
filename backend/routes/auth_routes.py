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
    name = data["name"]
    email = data["email"]
    password = data["password"]
    role = data["role"]  

    # Şifreyi hashle
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    conn = get_db_connection()
    cur = conn.cursor()
            #to do  : as user registers create a shopping cart and wishlist for them
    # Kullanıcıyı home_address olmadan ekleyelim

    try:
        cur.execute('''
            INSERT INTO users (name, email, password, role) 
            VALUES (%s, %s, %s, %s)
        ''', (name, email, hashed_password.decode("utf-8"), role))
        user_id = cur.fetchone()[0]


        if role == "customer":
            #create a shopping cart and wishlist for the user
            cur.execute('''
                INSERT INTO shoppingcart (user_id) 
                VALUES (%s)
            ''', (  user_id,))
            cur.execute(''' 
                INSERT INTO wishlist (user_id) 
                VALUES (%s)
            ''', (  user_id,))

        if role == "product_manager" or   "sales_manager":
            # create or assign a company to the user 
            company_id = data["company_id"] 
            cur.execute(''' INSERT INTO companymanagers (user_id, company_id)
            VALUES (%s, %s)''', (user_id, company_id))



    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400  

    finally:
        conn.commit()
        cur.close()
        conn.close()

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
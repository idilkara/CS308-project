

# The user should be able to browse and purchase the products through the website.
#  Additionally, the website should provide an admin interface for managerial tasks.

#The product managers shall add/remove products as well as product categories, and manage the stocks.
# Everything related to stock shall be done by the product manager. 

## add quantity to product given product id


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection


# Create a new product - product manager does these
import logging


pm_products_bp = Blueprint("pm_products", __name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@pm_products_bp.route('/product/create', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No input data provided")
        
        name = data.get('name')
        model = data.get('model')
        description = data.get('description')
        stock_quantity = data.get('stock_quantity')
        distributor_information = data.get('distributor_information')
        categories = data.get('categories', [])
        
        if not all([name, model, description, stock_quantity, distributor_information]):
            raise ValueError("Missing required fields")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check user role
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        role = cursor.fetchone()
        
        if not role or role[0] != "product_manager":
            raise PermissionError("Unauthorized access")
        
        # Insert the new product
        cursor.execute("""
            INSERT INTO products (name, model, description, stock_quantity, distributor_information, product_manager)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING product_id;
        """, (name, model, description, stock_quantity, distributor_information, user_id))
        product_id = cursor.fetchone()[0]
        
        # Process categories and insert them into productcategories
        for category_name in categories:
            cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
            category = cursor.fetchone()
            
            if category:
                category_id = category[0]
            else:
                cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
                category_id = cursor.fetchone()[0]
                
            cursor.execute("""
                INSERT INTO productcategories (product_id, category_id)
                VALUES (%s, %s);
            """, (product_id, category_id))
        
        conn.commit()

    
    except PermissionError as pe:
        logger.warning(f"Unauthorized attempt by user {user_id}: {pe}")
        return jsonify({"error": str(pe)}), 403
    except ValueError as ve:
        logger.error(f"Invalid input: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        conn.rollback()
        logger.exception("Unexpected error while creating product")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        
        cursor.close()
        conn.close()
    return jsonify({"message": "Product created successfully", "product_id": product_id}), 201


# Update product info by product ID 
@pm_products_bp.route('/product/update/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):

    user_id = get_jwt_identity()
    
    
    #check if product,s produtmanager is thsi user 
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, user_info["user_id"]))
    product = cursor.fetchone()
    if not product:
        return jsonify({"error": "Product not found or not authorized"}), 404
        
    data = request.get_json()
    name = data.get('name')
    model = data.get('model')
    description = data.get('description')
    stock_quantity = data.get('stock_quantity')
    price = data.get('price')
    categories = data.get('categories', [])

    conn = get_db_connection()
    cursor = conn.cursor()

    try:    
        cursor.execute("""
            UPDATE products SET name = %s, model = %s, description = %s, stock_quantity = %s, price = %s
            WHERE product_id = %s RETURNING product_id;
        """, (name, model, description, stock_quantity, price, product_id))
        updated_product = cursor.fetchone()

        if updated_product:
            # Clear existing categories
            cursor.execute("DELETE FROM productcategories WHERE product_id = %s", (product_id,))

            # Insert new categories
            for category_name in categories:
                cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
                category = cursor.fetchone()
                if category:
                    category_id = category[0]
                else:
                    cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
                    category_id = cursor.fetchone()[0]

                cursor.execute("""
                    INSERT INTO productcategories (product_id, category_id)
                    VALUES (%s, %s);
                """, (product_id, category_id))
        else:
            cursor.close()
            conn.close()
            return jsonify({"error": "Product not found"}), 404
            
    except Exception as e:
        conn.rollback() 
        return jsonify({"error": str(e)}), 500

    finally:
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product updated successfully"}), 200
    

# Update product STOCK by product ID 
@pm_products_bp.route('/product/update_stock_quantity/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product_stock(product_id):

    user_info = get_jwt_identity()
    user_role = user_info["role"]

    if user_role != "product_manager":
        return jsonify({"error": "Unauthorized access"}), 403

    #check if product,s produtmanager is thsi user 
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, user_info["user_id"]))
    product = cursor.fetchone()
    if not product:
        return jsonify({"error": "Product not found or not authorized"}), 404
    
    data = request.get_json()
    stock_quantity = data.get('stock_quantity')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:    
        cursor.execute("""
            UPDATE products SET stock_quantity = %s
            WHERE product_id = %s RETURNING product_id;
        """, ( stock_quantity, product_id))
        updated_product = cursor.fetchone()


        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404
            
    except Exception as e:
        conn.rollback() 
        return jsonify({"error": str(e)}), 500

    finally:
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product quantity updated successfully"}), 200
    

# remove product by product ID 
@pm_products_bp.route('/product/delete/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):

    user_info = get_jwt_identity()
    user_role = user_info["role"]

    if user_role != "product_manager":
        return jsonify({"error": "Unauthorized access"}), 403
    
            #check if product,s produtmanager is thsi user 
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, user_info["user_id"]))
    product = cursor.fetchone()
    if not product:
        return jsonify({"error": "Product not found or not authorized"}), 404
    

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        #check if product,s produtmanager is thsi user 
        cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, user_info["user_id"]))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Product not found or not authorized"}), 404
        
        #delete the product
        cursor.execute("DELETE FROM productcategories WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM products WHERE product_id = %s RETURNING product_id", (product_id,))
        deleted_product = cursor.fetchone()

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()

    if deleted_product:
        return jsonify({"message": "Product deleted successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404
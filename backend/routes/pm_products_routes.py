

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

# VIEW PM MANAGERS PRODUCTS 
@pm_products_bp.route('/viewproducts', methods=['GET'])
@jwt_required()
def view_products():
    userid = get_jwt_identity()

    # Check role
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        cursor.execute("SELECT * FROM products WHERE product_manager = %s", (userid,))
        products = cursor.fetchall()

        if not products:
            return jsonify({"message": "No products found"}), 404

        product_list = []
        for product in products:
            product_list.append({
                "product_id": product[0],
                "name": product[1],
                "model": product[2],
                "description": product[3],
                "stock_quantity": product[4],
                "distributor_information": product[5],
                "product_manager": product[6],
                "author": product[7]
            })

        return jsonify(product_list), 200

    except Exception as e:
        logger.exception("Unexpected error while fetching products")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@pm_products_bp.route('/product/create', methods=['POST'])
@jwt_required()
def create_product():
    userid = get_jwt_identity()

    #chedck role
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403
    

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
        author = data.get('author')
        
        required_fields = [name, model, description, distributor_information, author]
        if any(field is None for field in required_fields) or stock_quantity is None:
            raise ValueError("Missing required fields")

        
        
        # Check user role
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
        role = cursor.fetchone()
        
        if not role or role[0] != "product_manager":
            raise PermissionError("Unauthorized access")
        
        # Insert the new product
        cursor.execute("""
            INSERT INTO products (name, model, description, stock_quantity, distributor_information, product_manager, author)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING product_id;
        """, (name, model, description, stock_quantity, distributor_information, userid, author))
        product_id = cursor.fetchone()[0]
        
        # Process categories and insert them into productcategories
        for category_name in categories:
            cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
            category = cursor.fetchone()
            
            if category:
                logger.debug("Category found: %s", category)
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
        logger.warning(f"Unauthorized attempt by user {userid}: {pe}")
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

    userid = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403
    
    #check if product,s produtmanager is thsi user 
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, userid, ))
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
    userid = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check the user's role
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
        role = cursor.fetchone()[0]
        logger.debug("role: %s", role)
        if role != "product_manager":
            return jsonify({"error": "Unauthorized access"}), 403

        # Check if the product belongs to this product manager
        cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, userid))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Product not found or not authorized"}), 404

        # Get the new stock quantity from the request
        data = request.get_json()
        stock_quantity = data.get('stock_quantity')

        # Update the stock quantity
        cursor.execute("""
            UPDATE products SET stock_quantity = %s
            WHERE product_id = %s RETURNING product_id;
        """, (stock_quantity, product_id))
        updated_product = cursor.fetchone()

        if not updated_product:
            return jsonify({"error": "Product not found"}), 404

        conn.commit()
        return jsonify({"message": "Product quantity updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating product stock: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# remove product by product ID 
@pm_products_bp.route('/product/delete/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):

    userid = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403

            #check if product,s produtmanager is thsi user 
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, userid))
    product = cursor.fetchone()
    if not product:
        return jsonify({"error": "Product not found or not authorized"}), 404

    try:
        
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

    
    

#  add category to a prduct
@pm_products_bp.route('/product/add_category/<int:product_id>', methods=['POST'])
@jwt_required() 
def add_category_to_product(product_id):
    userid = get_jwt_identity()
        
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()
    category_name = data.get('category_name')


    try:
        cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
        category = cursor.fetchone()
        if not category:
            #create category
            cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
            category = cursor.fetchone()

        
        cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, userid, ))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Product not found or not authorized"}), 404

        cursor.execute("""
            INSERT INTO productcategories (product_id, category_id)
            VALUES (%s, %s);
        """, (product_id, category[0]))

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()

    return jsonify({"message": "Category added to product successfully"}), 200


# remove category from a prduct
@pm_products_bp.route('/product/remove_category/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_category_from_product(product_id):
    userid = get_jwt_identity()
        
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "product_manager"):
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()
    category_name = data.get('category_name')


    try:
        cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
        category = cursor.fetchone()
        if not category:
            return jsonify({"error": "Category not found"}), 404

        
        cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND product_manager = %s", (product_id, userid, ))
        product = cursor.fetchone()
        if not product:
            return jsonify({"error": "Product not found or not authorized"}), 404

        cursor.execute("""
            DELETE FROM productcategories WHERE product_id = %s AND category_id = %s;
        """, (product_id, category[0]))

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.commit()
        cursor.close()
        conn.close()

    return jsonify({"message": "Category removed from product successfully"}), 200





# The user should be able to browse and purchase the products through the website.
#  Additionally, the website should provide an admin interface for managerial tasks.

#The product managers shall add/remove products as well as product categories, and manage the stocks.
# Everything related to stock shall be done by the product manager. 
# The product manager is also in the role of delivery department since it controls the stock. 
# This means, the product manager shall view the invoices, 
# products to be delivered, and the corresponding addresses for delivery. 
# A delivery list has the following properties: delivery ID, customer ID, product ID, quantity, total price, delivery address, and a field showing whether the delivery has been completed or not. 
# The product manager can also update the status of an order. 
# Last but not least, the product managers shall approve or disapprove the comments. 

## add quantity to product given product id


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

pm_products_bp = Blueprint("pm_products", __name__)
# Create a new product - product manager does these
@pm_products_bp.route('/product/create', methods=['POST'])
@jwt_required()
def create_product():

    user_info = get_jwt_identity()
    user_role = user_info["role"]

    if user_role != "product_manager":
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()
    name = data.get('name')
    model = data.get('model')
    description = data.get('description')
    stock_quantity = data.get('stock_quantity')
    price = data.get('price')
    categories = data.get('categories', [])

    # Validate required fields
    if not name or not stock_quantity or not price:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert the new product
    cursor.execute("""
        INSERT INTO products (name, model, description, stock_quantity)
        VALUES (%s, %s, %s, %s, %s) RETURNING product_id;
    """, (name, model, description, stock_quantity))
    product_id = cursor.fetchone()[0]

    # Process categories and insert them into productcategories
    for category_name in categories:
        # Check if the category already exists
        cursor.execute("SELECT category_id FROM categories WHERE name = %s", (category_name,))
        category = cursor.fetchone()

        if category:
            # Category exists, get the existing category_id
            category_id = category[0]
        else:
            # Category does not exist, insert it
            cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING category_id", (category_name,))
            category_id = cursor.fetchone()[0]

        # Insert the mapping into productcategories
        cursor.execute("""
            INSERT INTO productcategories (product_id, category_id)
            VALUES (%s, %s);
        """, (product_id, category_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Product created successfully", "product_id": product_id}), 201

# Add category to product given product id


# Update product info by product ID 
@pm_products_bp.route('/product/update/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    data = request.get_json()
    name = data.get('name')
    model = data.get('model')
    description = data.get('description')
    stock_quantity = data.get('stock_quantity')
    price = data.get('price')
    categories = data.get('categories', [])

    conn = get_db_connection()
    cursor = conn.cursor()

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

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product updated successfully"}), 200
    else:
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

# remove product by product ID
@pm_products_bp.route('/product/delete/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM productcategories WHERE product_id = %s", (product_id,))
    cursor.execute("DELETE FROM products WHERE product_id = %s RETURNING product_id", (product_id,))
    deleted_product = cursor.fetchone()

    conn.commit()
    cursor.close()
    conn.close()

    if deleted_product:
        return jsonify({"message": "Product deleted successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404
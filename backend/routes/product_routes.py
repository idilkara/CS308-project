from flask import Blueprint, request, jsonify
import psycopg2
import os

products_bp = Blueprint("products", __name__)

# Database connection function
def get_db_connection():
    return psycopg2.connect(
        host="db",
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD')
    )

# List all products with name, price, and category
@products_bp.route('/products', methods=['GET'])
def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.price, array_agg(c.name) AS categories
        FROM products p
        LEFT JOIN productcategories pc ON p.product_id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.category_id
        GROUP BY p.product_id;
    """)
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"product_id": product[0], "name": product[1], "price": str(product[2]), "categories": product[3]}
        for product in products
    ])

# View product info by product ID
@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.model, p.description, p.stock_quantity, p.price, array_agg(c.name) AS categories
        FROM products p
        LEFT JOIN productcategories pc ON p.product_id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.category_id
        WHERE p.product_id = %s
        GROUP BY p.product_id;
    """, (product_id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()

    if product:
        return jsonify({
            "product_id": product[0],
            "name": product[1],
            "model": product[2],
            "description": product[3],
            "stock_quantity": product[4],
            "price": str(product[5]),
            "categories": product[6]
        })
    else:
        return jsonify({"error": "Product not found"}), 404

# Create a new product
@products_bp.route('/products', methods=['POST'])
def create_product():

    print("hello")
    data = request.get_json()
    name = data.get('name')
    model = data.get('model')
    description = data.get('description')
    stock_quantity = data.get('stock_quantity')
    price = data.get('price')
    categories = data.get('categories', [])

    if not name or not stock_quantity or not price:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO products (name, model, description, stock_quantity, price)
        VALUES (%s, %s, %s, %s, %s) RETURNING product_id;
    """, (name, model, description, stock_quantity, price))
    product_id = cursor.fetchone()[0]

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

    return jsonify({"message": "Product created successfully", "product_id": product_id}), 201

# Update product info by product ID
@products_bp.route('/products/<int:product_id>', methods=['PUT'])
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

# Delete product by product ID
@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
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




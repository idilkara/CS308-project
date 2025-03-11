from flask import Blueprint, request, jsonify
from db import get_db_connection

products_bp = Blueprint("products", __name__)

#1. The application shall present a number of products in categories 
# and let users select and add the desired product/products 
# to the shopping cart to purchase them.

# present products all products
@products_bp.route('/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"product_id": product[0], "name": product[1], "model": product[2], "description": product[3], "stock_quantity": product[4], "price": str(product[5])}
        for product in products
    ])

# List all products with name, price, category, and description - this is to help serach in frontend
@products_bp.route('/viewall', methods=['GET'])
def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.price, p.description, array_agg(c.name) AS categories
        FROM products p
        LEFT JOIN productcategories pc ON p.product_id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.category_id
        GROUP BY p.product_id;
    """)
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"product_id": product[0], "name": product[1], "price": str(product[2]), "description": product[3], "categories": product[4]}
        for product in products
    ])


# present products given categories
@products_bp.route('/products/category/<int:category_id>', methods=['GET'])
def get_products_by_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.model, p.description, p.stock_quantity, p.price
        FROM products p
        JOIN productcategories pc ON p.product_id = pc.product_id
        WHERE pc.category_id = %s
    """, (category_id,))
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"product_id": product[0], "name": product[1], "model": product[2], "description": product[3], "stock_quantity": product[4], "price": str(product[5])}
        for product in products
    ])

# present product given product id
@products_bp.route('/product/info/<int:product_id>', methods=['GET'])
def get_product(product_id):
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



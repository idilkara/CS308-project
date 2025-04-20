from flask import Blueprint, request, jsonify
from db import get_db_connection

products_bp = Blueprint("products", __name__)

#1. The application shall present a number of products in categories 
# and let users select and add the desired product/products 
# to the shopping cart to purchase them.

# [1]present a number of products in categories 

import logging


logging.basicConfig(level=logging.DEBUG)


# returns the list of products 
@products_bp.route('/products', methods=['GET'])
def get_products():
    logging.debug(f"Received {request.method} request at /products")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE waiting = FALSE")
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    if not products:
        logging.warning("No products found.")

    return jsonify([
        {
            "product_id": product[0],
            "name": product[1],
            "model": product[2],
            "description": product[3],
            "stock_quantity": product[4],
            "price": str(product[5]),
            "warranty_status": product[6],
            "distributor_information": product[7],
            "author": product[10],
            # "sales_manager": product[8],
            # "product_manager": product[9],
            # "waiting": product[10]
        }
        for product in products
    ])

# returns the list of products 
@products_bp.route('/viewall', methods=['GET'])
def get_all_products():
    logging.debug(f"Received {request.method} request at /viewall")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.price, p.description, array_agg(c.name) AS categories,
       p.warranty_status, p.distributor_information, p.sales_manager, 
       p.product_manager, p.waiting, p.author, p.stock_quantity,  p.model, p.serial_number

        FROM products p
        LEFT JOIN productcategories pc ON p.product_id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.category_id
        WHERE p.waiting = FALSE
        GROUP BY p.product_id;
    """)
    products = cursor.fetchall()


    # Get the ratings for each product
    cursor.execute("""
        SELECT p.product_id, AVG(r.rating) AS average_rating
        FROM products p
        LEFT JOIN reviews r ON p.product_id = r.product_id
        GROUP BY p.product_id;
    """)
    ratings = cursor.fetchall()
    logging.debug(f"Ratings fetched: {ratings}")
    ratings_dict = {rating[0]: (rating[1] if rating[1] is not None else 0) for rating in ratings}


    cursor.close()
    conn.close()

    if not products:
        logging.warning("No products found in /viewall.")

    return jsonify([
    {
        "product_id": product[0],
        "name": product[1],
        "price": str(product[2]),
        "description": product[3],
        "categories": product[4],
        "warranty_status": product[5],
        "distributor_information": product[6],
        "sales_manager": product[7],
        "product_manager": product[8],
        "waiting": product[9],
        "author": product[10],
        "stock_quantity": product[11],  # Add this line
        "average_rating": str(ratings_dict.get(product[0], 0)),
          "model": product[12],  # Add this line
          "serial_number": product[13]  # Add this line
    }
    for product in products
])



# returns a dictionary of products given category ID
@products_bp.route('/products/category/<int:category_id>', methods=['GET'])
def get_products_by_category(category_id):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.model, p.description, p.stock_quantity, p.price, p.warranty_status, p.distributor_information, p.sales_manager, p.product_manager, p.waiting, p.author
        FROM products p
        JOIN productcategories pc ON p.product_id = pc.product_id
        WHERE pc.category_id = %s AND p.waiting = FALSE
    """, (category_id,))
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {
            "product_id": product[0],
            "name": product[1],
            "model": product[2],
            "description": product[3],
            "stock_quantity": product[4],
            "price": str(product[5]),
            "warranty_status": product[6],
            "distributor_information": product[7],
            "sales_manager": product[8],
            "product_manager": product[9],
            "waiting": product[10],
            "author": product[11]
        }
        for product in products
    ])


# present product information given product id
@products_bp.route('/product/info/<int:product_id>', methods=['GET'])
def get_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.product_id, p.name, p.model, p.description, p.stock_quantity, p.price, array_agg(c.name) AS categories, p.warranty_status, p.distributor_information, p.sales_manager, p.product_manager, p.waiting, p.author, p.serial_number
        FROM products p
        LEFT JOIN productcategories pc ON p.product_id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.category_id
        WHERE p.product_id = %s AND p.waiting = FALSE
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
            "categories": product[6],
            "warranty_status": product[7],
            "distributor_information": product[8],
            "sales_manager": product[9],
            "product_manager": product[10],
            "waiting": product[11],
            "author": product[12],
            "serial_number": product[13]
        })
    else:
        return jsonify({"error": "Product not found"}), 404

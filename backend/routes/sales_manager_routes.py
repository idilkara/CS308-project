# 12. The sales managers are responsible for setting the prices of the products. 
# New products added by the product manager should only appear after their prices have been set by a sales manager.
#  Additionally, they shall set a discount on the selected items. 
# When the discount rate and the products are given, 
# the system automatically sets the new price and notify the users, 
# whose wish list includes the discounted product, about the discount. 
# They shall also view all the invoices in a given date range, 
# can print them or save them as PDF files.
# 
#  Last but not least, 
# they shall calculate the revenue and loss/profit in between given dates and view a chart of it. 
# For loss and profit calculations, the product cost can default to 50% of the sale price for convenience, or it can be specified by the product manager when adding the product.

# The sales manager will evaluate the refund request and upon receiving the product back to the store will authorize the refund. 
# If a refund is approved, the product will be added back to stock, and the customer must be notified—ideally via email—of the approval and refunded amount. 
# Moreover, if the product was bought during a discount campaign and the customer chooses to return the product after the campaign ends, 
# the refunded amount will be the same as the time of its purchase with the discount applied.

# view pruudcts that are waiting for price update.\\
import logging
from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity

sm_bp = Blueprint("sm", __name__)



# View products that are waiting for price update
# this one can view every waiting product
@sm_bp.route("/waiting_products", methods=["GET"])
@jwt_required()
def get_waiting_products():

    userid = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT role FROM users WHERE user_id = %s", (userid,))
    role = cursor.fetchone()[0]
    logger.debug("role: %s", role)
    if (role != "sales_manager"):
        return jsonify({"error": "Unauthorized access"}), 403


    cursor.execute("""
        SELECT product_id, name, model, description, stock_quantity, price, warranty_status, distributor_information, sales_manager, product_manager, waiting
        FROM products
        WHERE waiting = TRUE;
    """)
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
            "waiting": product[10]
        }
        for product in products
    ])
# Configure logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
@sm_bp.route("/update_price/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_price(product_id):

    logger.debug("Received request to update price for product_id: %d", product_id)

    user_id = get_jwt_identity()
    logger.debug("Authenticated user_id: %s", user_id)

    data = request.get_json()
    logger.debug("Request JSON data: %s", data)
    new_price = data.get('price')

    if new_price is None:
        logger.error("Missing price in request body")
        return jsonify({"error": "Missing price"}), 400

    # Use context manager to handle connection and cursor automatically
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:


                cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
                role = cursor.fetchone()[0]
                logger.debug("role: %s", role)
                if (role != "sales_manager"):
                    return jsonify({"error": "Unauthorized access"}), 403
    

                logger.debug("Executing SQL UPDATE for product_id: %d", product_id)
                cursor.execute("""
                    UPDATE products
                    SET price = %s, waiting = FALSE, sales_manager = %s
                    WHERE product_id = %s
                    RETURNING product_id, name, price;
                """, (new_price,  user_id ,product_id,))
                updated_product = cursor.fetchone()
                conn.commit()
                logger.info("Successfully updated product: %s", updated_product)


        if updated_product:
            return jsonify({
                "product_id": updated_product[0],
                "name": updated_product[1],
                "price": str(updated_product[2])
            })
        else:
            logger.warning("Product not found for product_id: %d", product_id)
            return jsonify({"error": "Product not found"}), 404

    except Exception as e:
        logger.exception("Error updating product_id: %d", product_id)
        return jsonify({"error": str(e)}), 500
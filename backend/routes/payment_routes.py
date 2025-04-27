

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log
from .invoices import generate_invoice_pdf, send_invoice_email, generate_invoice_pdf_asBytes
import logging


#4. They, however, should login before placing an order and making a payment.
#  Upon logging in, any products previously added to their cart should be retained.
#  Once payment is made and confirmed by the (mock-up) banking entity, 
# an invoice must be shown on the screen and 
# a PDF copy of the invoice should be emailed to the user.

# todo pdf gondermece 
# A customer should enter his/her credit card information to purchase a product. 
# Credit card verification and limit issues are out of scope of the project.

# create a order, add the products in cart to the order and remove the products from the cart
# stock should decrease after the order is created 
# When the shopping is done, that product should be decreased from the stock and 


payment_bp = Blueprint("payment", __name__)

# buy everything in the cart
# create order and remove the products from the cart
@payment_bp.route("/create_order", methods=["POST"])
@jwt_required()
def create_order():

    user_id = get_jwt_identity()  # Ensure this returns the user_id as a string
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get the user's delivery address
        cur.execute("""
            SELECT home_address FROM users WHERE user_id = %s
        """, (user_id,))
        delivery_address = cur.fetchone()[0]

        # Get all items in the user's shopping cart
        cur.execute("""
            SELECT p.product_id, p.name, p.price, scp.quantity, p.stock_quantity
            FROM shoppingcart sc
            JOIN shoppingcartproducts scp ON sc.cart_id = scp.cart_id
            JOIN products p ON scp.product_id = p.product_id
            WHERE sc.user_id = %s
        """, (user_id,))
        cart_items = cur.fetchall()

        if not cart_items:
            raise ValueError("Cart is empty")


        #check if user have home address and payment method set

        cur.execute("""
            SELECT home_address, payment_method FROM users WHERE user_id = %s
        """, (user_id,))
        user_info = cur.fetchone()
        if not user_info or not user_info[0] or not user_info[1]:
            raise ValueError("User does not have a delibery address or payment method set")

        total_price = sum(item[2] * item[3] for item in cart_items)

        # check if there are enpugh stock for the products in the cart
        for item in cart_items:
            product_id = item[0]
            quantity = item[3]
            cur.execute("SELECT stock_quantity FROM products WHERE product_id = %s", (product_id,))
            stock_quantity = cur.fetchone()[0]

            if stock_quantity < quantity:
                raise ValueError(f"Not enough stock for product {item[1]}")
        
        itemsAmountAndPrice = []
        # Create user order
        cur.execute("INSERT INTO userorders (user_id, total_price, delivery_address) VALUES (%s, %s, %s) RETURNING order_id", (user_id, total_price, delivery_address))
        userorder_id = cur.fetchone()[0]

        # Add items to order and decrease stock quantity
        for item in cart_items:
            product_id = item[0]
            price = item[2] # TODO : price might change based on discounts
            quantity = item[3]
            stock_quantity = item[4]

            cur.execute("SELECT discount_amount from discounts where product_id = %s", (product_id,))
            discount_amount = cur.fetchone()    
            if discount_amount:
                price = price - price * discount_amount[0]

            if stock_quantity < quantity:
                raise ValueError(f"Not enough stock for product {item[1]}")

            # Decrease the stock quantity
            new_stock_quantity = stock_quantity - quantity
            cur.execute("UPDATE products SET stock_quantity = %s WHERE product_id = %s", (new_stock_quantity, product_id))
            cur.execute("INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)", (userorder_id, product_id, quantity, price))
            
            cur.execute("SELECT name FROM products WHERE product_id = %s", (product_id,))
            product_name = cur.fetchone()[0]
            itemAmountAndPrice = {"productName": product_name , "quantity": quantity, "UnitPrice": price}
            itemsAmountAndPrice.append(itemAmountAndPrice)

        # create payment
        cur.execute("""
            INSERT INTO payments (user_id, userorder_id, amount, payment_date)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP) RETURNING payment_id
        """, (user_id, userorder_id, total_price))
        payment_id = cur.fetchone()[0]


        # Generate invoices and invoice pdfs
        invoice_id = generate_invoices(userorder_id, payment_id)
        # Empty the shopping cart
        cur.execute("DELETE FROM shoppingcartproducts WHERE cart_id = (SELECT cart_id FROM shoppingcart WHERE user_id = %s)", (user_id,))

    except Exception as e:
        conn.rollback()
        log.error(f"Error occurred while creating order: {str(e)}")
        return jsonify({"error": str(e)}), 400
    else:
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Order created successfully", "invoice_id": invoice_id, "order_id": userorder_id}), 200



def generate_invoices(orderID, paymentID):

    conn = get_db_connection()
    cur = conn.cursor()

    # get userID and total price and the delivery address and order date 
    cur.execute("""
        SELECT u.user_id, u.home_address, o.total_price, o.order_date, u.name
        FROM userorders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = %s
    """, (orderID,))
    order = cur.fetchone()
    if not order:
        return jsonify({"error": "Order not found"}), 404
    customerID = order[0]
    delivery_address = order[1]
    total_price = order[2]
    order_date = order[3]
    customer_name = order[4]
    

    # get the order items 
    cur.execute("""
        SELECT oi.product_id, oi.quantity, oi.price, p.name
        FROM orderitems oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """, (orderID,))
    order_items = cur.fetchall() #type list of tuples 

    if not order_items:
        return jsonify({"error": "No items found for this order"}), 404
    
    cur.execute("""
        INSERT INTO invoices (user_id, order_id, payment_id, total_price, delivery_address, payment_status, invoice_date)
        VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING invoice_id
    """, (order[0], orderID, paymentID, order[2], order[1], 'paid'))
    invoice_id = cur.fetchone()[0]
    log.info(f"Invoice created with ID: {invoice_id}")
    USERINVOIDCEID = invoice_id
    

    conn.commit()

    # for each item in order_items, get the product name and quantity and price
    items = []
    setOfProductOwners = set()
    setOfSalesManagers = set()

    for item in order_items:
        items.append({
            "product_id": item[0],
            "quantity": item[1],
            "price": item[2],
            "name": item[3]
        })

        product_id = item[0]
        cur.execute("""
            SELECT product_manager FROM products WHERE product_id = %s
        """, (product_id,))
        product_owner = cur.fetchone()[0]
        setOfProductOwners.add(product_owner)

        cur.execute("""
            SELECT sales_manager FROM products WHERE product_id = %s
        """, (product_id,))
        sales_manager = cur.fetchone()[0]
        setOfSalesManagers.add(sales_manager)


    # generate the invoice pdf FOR USER
    log.info(f"generating invoice: {invoice_id}")
    pdf_asBytes = generate_invoice_pdf_asBytes(invoice_id, customer_name, delivery_address, items)
    log.info(f"invoice generated: {invoice_id}")

    cur.execute("""
        UPDATE invoices SET pdf_file = %s WHERE invoice_id = %s
    """, (pdf_asBytes, invoice_id))
    conn.commit()

    for product_owner in setOfProductOwners:
        items = []
        # get the order items
        cur.execute("""
            SELECT oi.product_id, oi.quantity, oi.price, p.name
            FROM orderitems oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = %s AND p.product_manager = %s
        """, (orderID, product_owner))
        order_items = cur.fetchall()
        if not order_items:
            continue
        for item in order_items:
            items.append({
                "product_id": item[0],
                "quantity": item[1],
                "price": item[2],
                "name": item[3]
            })

        total_price = sum(item[2] * item[1] for item in order_items)
        
        # insert the invoice for the product owner
        cur.execute("""
            INSERT INTO managerinvoices (user_id, order_id, payment_id, total_price, delivery_address, payment_status, invoice_date)
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING invoice_id
        """, (product_owner, orderID, paymentID, total_price,delivery_address, 'paid'))

        invoice_id = cur.fetchone()[0]
        log.info(f"Invoice created with ID: {invoice_id}")
        conn.commit()

        # generate the invoice pdf FOR PRODUCT OWNER
        pdf_asBytes = generate_invoice_pdf_asBytes(invoice_id, customer_name, delivery_address, items)
        log.info(f"invoice pdf generated: {invoice_id}")
        cur.execute("""
            UPDATE managerinvoices SET pdf_file = %s WHERE invoice_id = %s
        """, (pdf_asBytes, invoice_id))
        conn.commit()

    for sales_manager in setOfSalesManagers:

        items = []
        # get the order items
        cur.execute("""
            SELECT oi.product_id, oi.quantity, oi.price, p.name
            FROM orderitems oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = %s AND p.sales_manager = %s
        """, (orderID, sales_manager))
        order_items = cur.fetchall()
        if not order_items:
            continue
        for item in order_items:
            items.append({
                "product_id": item[0],
                "quantity": item[1],
                "price": item[2],
                "name": item[3]
            })

        total_price = sum(item[2] * item[1] for item in order_items)
        log.info(f"total price: {order}")
        # insert the invoice for the product owner
        cur.execute("""
            INSERT INTO managerinvoices (user_id, order_id, payment_id, total_price, delivery_address, payment_status, invoice_date)
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING invoice_id
        """, (product_owner,orderID, paymentID, total_price,delivery_address, 'paid'))

        invoice_id = cur.fetchone()[0]
        log.info(f"invoice pdf generated: {invoice_id}")
        conn.commit()

        # generate the invoice pdf For SalesManager
        pdf_asBytes = generate_invoice_pdf_asBytes(invoice_id, customer_name, delivery_address, items)
        cur.execute("""
            UPDATE managerinvoices SET pdf_file = %s WHERE invoice_id = %s
        """, (pdf_asBytes, invoice_id))
        conn.commit()


    return USERINVOIDCEID


"""
# Sending email with invoice
@payment_bp.route("/send_invoice_email", methods=["POST"])
@jwt_required()
def send_invoice_email_endpoint():
    user_id = get_jwt_identity()
    data = request.get_json()

    to_email = data.get("to_email")
    file_path = data.get("file_path")

    if not to_email or not file_path:
        return jsonify({"error": "Missing 'to_email' or 'file_path' field in request"}), 400

    try:
        send_invoice_email(to_email, file_path)
        logging.info(f"Invoice email sent successfully to {to_email} by user {user_id}")
        return jsonify({"message": f"Invoice email sent successfully to {to_email}."}), 200
    except Exception as e:
        logging.error(f"Failed to send invoice email: {e}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    """

@payment_bp.route("/send_invoice_email", methods=["POST"])
@jwt_required()
def send_invoice_email_endpoint():
    user_id = get_jwt_identity()
    data = request.get_json()

    to_email = data.get("to_email")
    invoice_id = data.get("invoice_id")

    if not to_email or not invoice_id:
        return jsonify({"error": "Missing 'to_email' or 'invoice_id' field in request"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Database'den PDF blob datasını çek
        cur.execute("SELECT pdf_file FROM invoices WHERE invoice_id = %s", (invoice_id,))
        row = cur.fetchone()

        if not row or not row[0]:
            return jsonify({"error": "Invoice PDF not found"}), 404
        
        pdf_data = row[0]

        # Mail gönder
        send_invoice_email(to_email, pdf_data)

        logging.info(f"Invoice email sent successfully to {to_email} by user {user_id}")
        return jsonify({"message": f"Invoice email sent successfully to {to_email}."}), 200

    except Exception as e:
        logging.error(f"Failed to send invoice email: {e}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

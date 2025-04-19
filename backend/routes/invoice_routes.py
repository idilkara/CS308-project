
from invoices import generate_invoice_pdf, send_invoice_email
import logging
from db import get_db_connection
from payment_routes import payment_bp
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Once payment is made and confirmed by the (mock-up) banking entity, 
# an invoice must be shown on the screen and 
# a PDF copy of the invoice should be emailed to the user.

# the product manager shall view the invoices, products to be delivered, and  the corresponding addresses for delivery
# sales manager hey shall also view all the invoices in a given date range, can print them or save them as PDF files 

@payment_bp.route("/generate_invoice", methods=["POST"])
@jwt_required()
def generate_invoice():
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cur = conn.cursor()

    # SORGUNUN FROM KISMI EKLENDİ
    cur.execute("""
        SELECT o.order_id, o.total_price, o.status, o.delivery_address
        FROM userorders o
        WHERE o.user_id = %s AND o.status IN ('processing', 'delivered')
        ORDER BY o.order_date DESC LIMIT 1
    """, (user_id,))
    
    order = cur.fetchone()

    if not order:
        return jsonify({"error": "No completed order found for this user"}), 404

    order_id, total_price, status, delivery_address = order

    cur.execute("""
        INSERT INTO invoices (user_id, total_amount, delivery_address, payment_status)
        VALUES (%s, %s, %s, %s) RETURNING invoice_id
    """, (user_id, total_price, delivery_address, 'paid'))
    invoice_id = cur.fetchone()[0]
    conn.commit()

    # Sipariş ürünlerini al, ürün adları dahil
    cur.execute("""
        SELECT p.name, oi.quantity, (oi.price * oi.quantity)
        FROM orderitems oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """, (order_id,))
    items = cur.fetchall()

    item_details = [{"name": item[0], "quantity": item[1], "total_price": item[2]} for item in items]

    cur.execute('SELECT name, email FROM users WHERE user_id = %s', (user_id,))
    user_name, user_email = cur.fetchone()

    pdf_path = generate_invoice_pdf(invoice_id, user_name, total_price, item_details)
    print(f"PDF generated at: {pdf_path}")

    # SMTP ayarları doğruysa bunu aç, değilse yorumla
    #send_invoice_email(user_email, pdf_path)

    cur.close()
    conn.close()

   

    with open(pdf_path, "rb") as f:
        encoded_pdf = base64.b64encode(f.read()).decode("utf-8")

    return jsonify({
        "message": "Invoice generated",
        "invoice_id": invoice_id,
        "pdf_base64": encoded_pdf
    }), 200





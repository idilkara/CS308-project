
from .invoices import generate_invoice_pdf, send_invoice_email
import logging
from db import get_db_connection

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import Response

import base64


# Once payment is made and confirmed by the (mock-up) banking entity, 
# an invoice must be shown on the screen and 
# a PDF copy of the invoice should be emailed to the user.

# the product manager shall view the invoices, products to be delivered, and  the corresponding addresses for delivery
# sales manager hey shall also view all the invoices in a given date range, can print them or save them as PDF files 



invoice_bp = Blueprint("invoice", __name__)
@invoice_bp.route("/get_invoice_pdf/<invoiceID>", methods=["GET"])
@jwt_required()
def get_invoice_pdf(invoiceID):

    user_id = get_jwt_identity()
    logging.info(f"User ID: {user_id}")
    logging.info(f"Invoice ID: {invoiceID}")
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT pdf_file 
        FROM invoices
        WHERE invoice_id = %s AND user_id = %s  
    """, (invoiceID, user_id))

    result = cur.fetchone()
    logging.info(f"Fetched invoice data: {result}")
    cur.close()
    conn.close()

    if result is None:
        return {"message": "Invoice not found or not authorized"}, 404

    pdf_data = result[0]

    return Response(
        pdf_data,
        mimetype='application/pdf',
        headers={
            "Content-Disposition": f'inline; filename=invoice_{invoiceID}.pdf'
        }
    )



@invoice_bp.route("/generate_invoice", methods=["POST"])
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
        INSERT INTO invoices (user_id, total_price, delivery_address, payment_status)
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


#  Sending email with invoice
@invoice_bp.route("/send_invoice_email", methods=["POST"])
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





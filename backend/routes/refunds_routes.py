from flask import Blueprint, request, jsonify
from db import get_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import psycopg2
import smtplib
import logging

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# A customer shall also be able to selectively return a product and ask for a refund. 
# In such a case, the customer will select an already purchased product from his/her order history within 30 days of purchase, 
# provided the product has been delivered. 
# 
# The sales manager will evaluate the refund request and upon receiving the product back to the store will authorize the refund. 
# If a refund is approved, the product will be added back to stock, and the customer must be notified—ideally via email—of the approval and refunded amount. 
# Moreover, if the product was bought during a discount campaign and the customer chooses to return the product after the campaign ends, 
# the refunded amount will be the same as the time of its purchase with the discount applied.

# IMPLEMENT EDILCEKLER: 
    # request return product given order id , product id 
    # accept return request  (update status)
    # reject return request     (update status)
    # get requests for sales manager 



refunds_bp = Blueprint("refunds", __name__)


def generate_refund_receipt_pdf(invoice_id, customer_name, delivery_address, refunded_items, refund_amount):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=1 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.darkblue,
        spaceAfter=12
    )

    subheader_style = ParagraphStyle(
        'SubHeader',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.darkblue,
        spaceAfter=6
    )

    normal_style = styles['Normal']

    elements = []

    # Title
    elements.append(Paragraph("Refund Confirmation", header_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Date and Customer Info
    current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    info_data = [
        ["Refund ID:", invoice_id],
        ["Date:", current_date],
        ["Customer:", customer_name],
        ["Delivery Address:", delivery_address]
    ]
    info_table = Table(info_data, colWidths=[1.5 * inch, 4.5 * inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Items Table
    elements.append(Paragraph("Refunded Items", subheader_style))
    elements.append(Spacer(1, 0.1 * inch))

    item_table_data = [["Product", "Qty", "Unit Price", "Refunded Amount"]]
    for item in refunded_items:
        item_table_data.append([
            item['name'],
            str(item['quantity']),
            f"${item['price']:.2f}",
            f"${item['quantity'] * item['price']:.2f}"
        ])
    item_table_data.append(["", "", "Total Refunded:", f"${refund_amount:.2f}"])

    table = Table(item_table_data, colWidths=[2.5 * inch, 1 * inch, 1.25 * inch, 1.25 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.darkblue),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -2), 0.5, colors.grey),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 0.5 * inch))

    # Notes
    elements.append(Paragraph(
        "Your refund request has been evaluated and approved by our Sales Management Team.", normal_style))
    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph(
        "Please note: If the item was purchased during a discount campaign, the refund reflects the price paid at the time of purchase.", normal_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph("We appreciate your understanding and look forward to serving you again!", normal_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()



# Mock e-posta gönderimi (MailHog)

def send_refund_email(to_email, refund_amount, pdf_data):
    from_email = "refunds@odysseybooks.com"
    subject = "Your Refund Has Been Approved (Mock Email)"

    # E-posta mesajını oluştur
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    # Gövde metni
    body = (
        f"Dear Customer,\n\n"
        f"Your refund request has been successfully approved.\n"
        f"Refunded Amount: ${refund_amount:.2f}\n\n"
        f"Please find attached your refund receipt.\n\n"
        f"Thank you for shopping with Odyssey Books.\n"
    )
    msg.attach(MIMEText(body, 'plain'))

    # PDF eklentisi
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(pdf_data)
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment; filename="refund_receipt.pdf"')
    msg.attach(part)

    # MailHog üzerinden gönder
    try:
        with smtplib.SMTP('mailhog', 1025) as server:
            server.sendmail(from_email, to_email, msg.as_string())
        print(f"Mock email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send mock email: {e}")


# 1️⃣ Refund Talebi Oluştur
@refunds_bp.route('/request-refund', methods=['POST'])
@jwt_required()
def request_refund():
    data = request.get_json()
    user_id = get_jwt_identity()
    orderitem_id = data.get("orderitem_id")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the order item is already refunded
    cur.execute("""
        SELECT COUNT(*) FROM refunds
        WHERE orderitem_id = %s 
    """, (orderitem_id,))
    duplicate_check = cur.fetchone()[0]
    if duplicate_check > 0:
        return jsonify({"error": "Request has already been sent"}), 201
    

    cur.execute("""
        SELECT oi.product_id, oi.order_id, oi.status, uo.order_date, oi.price
        FROM orderitems oi
        JOIN userorders uo ON oi.order_id = uo.order_id
        WHERE oi.orderitem_id = %s AND uo.user_id = %s
    """, (orderitem_id, user_id))
    result = cur.fetchone()

    if not result:
        return jsonify({"error": "Order item not found."}), 404

    product_id, order_id, status, order_date, paid_price = result

    if status != "delivered":
        return jsonify({"error": "Only delivered items can be refunded."}), 400

    if datetime.now() - order_date > timedelta(days=30):
        return jsonify({"error": "Refund period expired."}), 400

    # Talebi kaydet
    cur.execute("""
        INSERT INTO refunds (orderitem_id, user_id, product_id, refund_amount)
        VALUES (%s, %s, %s, %s)
        RETURNING refund_id
    """, (orderitem_id, user_id, product_id, paid_price))
    refund_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Refund request submitted", "refund_id": refund_id}), 201


# 2️⃣ Refund Taleplerini Listele
@refunds_bp.route('/refund-requests', methods=['GET'])
@jwt_required()
def list_refund_requests():
    conn = get_db_connection()
    cur = conn.cursor()

    # product name de gelsin             "user_name": r[8],   "order_id": r[9],
    cur.execute("""
        SELECT r.refund_id, r.orderitem_id, r.user_id, r.product_id, r.refund_amount, r.status, r.request_date, p.name, u.name, oi.order_id
        FROM refunds r
        JOIN orderitems oi ON r.orderitem_id = oi.orderitem_id
        JOIN products p ON oi.product_id = p.product_id
        JOIN users u ON r.user_id = u.user_id
        ORDER BY request_date DESC
    """)
    data = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "refund_id": r[0],
            "orderitem_id": r[1],
            "product_name": r[7],
            "user_id": r[2],
            "product_id": r[3],
            "refund_amount": float(r[4]),
            "status": r[5],
            "request_date": r[6].isoformat(),
            "user_name": r[8],
            "order_id": r[9],
            
        } for r in data
    ])


# 3️⃣ Refund Onayla (Discount uygulanmışsa ona göre)
@refunds_bp.route('/approve-refund/<int:refund_id>', methods=['POST'])
@jwt_required()
def approve_refund(refund_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Kullanıcının kimliğini al ve rolünü kontrol et
    user_id = get_jwt_identity()
    cur.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
    role_row = cur.fetchone()
    if not role_row or role_row[0] != 'sales_manager':
        return jsonify({"error": "Only sales managers can approve refunds."}), 403

    # Refund ve müşteri bilgilerini getir
    cur.execute("""
        SELECT r.orderitem_id, r.product_id, r.user_id, r.status,
               u.email, u.name, u.home_address,
               oi.price, oi.quantity,
               p.name
        FROM refunds r
        JOIN orderitems oi ON r.orderitem_id = oi.orderitem_id
        JOIN users u ON r.user_id = u.user_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE r.refund_id = %s
    """, (refund_id,))
    result = cur.fetchone()

    if not result:
        return jsonify({'error': 'Refund request not found.'}), 404

    (orderitem_id, product_id, customer_id, status,
     email, customer_name, address,
     price, quantity, product_name) = result

    # Refund daha önce işlenmiş mi?
    if status != "requested":
        return jsonify({'error': 'Refund already processed.'}), 400

    

    # İade tutarı hesaplanır (sipariş esnasındaki net fiyat)
    refund_amount = float(price) * quantity

    # Refund'u onayla ve stoğu güncelle
    cur.execute("UPDATE refunds SET status = 'approved', refund_amount = %s WHERE refund_id = %s",
                (refund_amount, refund_id))
    cur.execute("UPDATE products SET stock_quantity = stock_quantity + %s WHERE product_id = %s",
                (quantity, product_id))
    
    conn.commit()

    # PDF oluştur
    refunded_items = [{
        "name": product_name,
        "quantity": quantity,
        "price": float(price)
    }]
    pdf_data = generate_refund_receipt_pdf(
        invoice_id=refund_id,
        customer_name=customer_name,
        delivery_address=address,
        refunded_items=refunded_items,
        refund_amount=refund_amount
    )

    # Mock e-posta gönder
    try:
        send_refund_email(email, refund_amount, pdf_data)
        logging.info(f"Refund approved and mock email sent to {email}")
    except Exception as e:
        logging.error(f"Failed to send mock email: {e}")
        return jsonify({"error": "Refund approved, but email could not be sent."}), 202

    cur.close()
    conn.close()

    return jsonify({
        "message": f"Refund approved and email sent to {email}.",
        "refunded_amount": refund_amount
    }), 200


# 4️⃣ Refund Reddet
@refunds_bp.route('/reject-refund/<int:refund_id>', methods=['POST'])
@jwt_required()
def reject_refund(refund_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT status FROM refunds WHERE refund_id = %s", (refund_id,))
    result = cur.fetchone()

    if not result or result[0] != "requested":
        return jsonify({"error": "Refund cannot be rejected."}), 400

    cur.execute("UPDATE refunds SET status = 'rejected' WHERE refund_id = %s", (refund_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Refund request rejected."})


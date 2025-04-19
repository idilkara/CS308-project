import logging
import base64
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
import smtplib
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io


### INVOICE FUNCTIONS
# PDF Oluşturma Fonksiyonu
def generate_invoice_pdf(invoice_id, user_name, total_amount, items):
    file_name = f"invoice_{invoice_id}.pdf"
  
    c = canvas.Canvas(file_name, pagesize=letter)
    c.setFont("Helvetica", 12)
    c.drawString(100, 750, f"Invoice ID: {invoice_id}")
    c.drawString(100, 735, f"Customer: {user_name}")
    c.drawString(100, 720, f"Total Amount: ${total_amount}")
    
    y_position = 700
    for item in items:
        c.drawString(100, y_position, f"Product: {item['name']}, Quantity: {item['quantity']}, Price: ${item['total_price']}")
        y_position -= 20
        
    c.save()
    return file_name


def generate_invoice_pdf_asBytes(invoice_id, user_name, deliveryAddress, items):
    buffer = io.BytesIO()  # in-memory buffer instead of file
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica", 12)

    c.drawString(100, 750, f"Invoice ID: {invoice_id}")

    c.drawString(100, 735, f"Customer: {user_name}")

    total_amount = sum(item['quantity'] * item['price'] for item in items)
    c.drawString(100, 720, f"Delivery Address: {deliveryAddress}")
    c.drawString(100, 710, f"Total Amount: ${total_amount}")

    y_position = 700
    for item in items:
        c.drawString(
            100, y_position,
            f"Product: {item['name']}, Quantity: {item['quantity']}, Unit Price: ${item['price']}, Total Price: ${item['quantity']*item['price']}"
        )
        y_position -= 20

    c.save()
    buffer.seek(0)  # go back to start of buffer

    return buffer.read()  # return binary PDF data


# E-posta Gönderme Fonksiyonu
def send_invoice_email(to_email, file_path):
    from_email = "your-email@example.com"
    password = "your-email-password"
    subject = "Your Invoice"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    part = MIMEBase('application', 'octet-stream')
    with open(file_path, 'rb') as file:
        part.set_payload(file.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', f"attachment; filename={file_path}")
    msg.attach(part)

    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())


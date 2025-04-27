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
from datetime import datetime

from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from email.mime.text import MIMEText
from email import encoders


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


# def generate_invoice_pdf_asBytes(invoice_id, user_name, deliveryAddress, items):
#     buffer = io.BytesIO()  # in-memory buffer instead of file
#     c = canvas.Canvas(buffer, pagesize=letter)
#     c.setFont("Helvetica", 12)
   
#     current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Format the timestamp
#     c.drawString(100, 750, f"DATE: {current_date}")
#     c.drawString(100, 750, f"Invoice ID: {invoice_id}")

#     c.drawString(100, 735, f"Customer: {user_name}")

#     total_amount = sum(item['quantity'] * item['price'] for item in items)
#     c.drawString(100, 720, f"Delivery Address: {deliveryAddress}")
#     c.drawString(100, 710, f"Total Amount: ${total_amount}")

#     y_position = 700
#     for item in items:
#         c.drawString(
#             100, y_position,
#             f"Product: {item['name']}, Quantity: {item['quantity']}, Unit Price: ${item['price']}, Total Price: ${item['quantity']*item['price']}"
#         )
#         y_position -= 20

#     c.save()
#     buffer.seek(0)  # go back to start of buffer

#     return buffer.read()  # return binary PDF data

def generate_invoice_pdf_asBytes(invoice_id, user_name, deliveryAddress, items):


    buffer = io.BytesIO()  # in-memory buffer instead of file
    
    # Create the document template
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    # Create custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.darkblue,
        spaceAfter=12
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.darkblue,
        spaceAfter=6
    )
    
    normal_style = styles['Normal']
    
    # Content elements will be added to this list
    elements = []
    
    # Add company header (you might want to replace with your company logo)
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Add invoice details
    current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Create a table for invoice details
    invoice_data = [
        ["Invoice ID:", invoice_id],
        ["Date:", current_date],
        ["Customer:", user_name],
        ["Delivery Address:", deliveryAddress]
    ]
    
    invoice_table = Table(invoice_data, colWidths=[1.5*inch, 4*inch])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Add items table with header
    elements.append(Paragraph("Items", header_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Define the table headers and data
    items_data = [['Product', 'Quantity', 'Unit Price', 'Total']]
    
    # Add item data rows
    for item in items:
        items_data.append([
            item['name'],
            str(item['quantity']),
            f"${item['price']:.2f}",
            f"${item['quantity'] * item['price']:.2f}"
        ])
    
    # Calculate total amount
    total_amount = sum(item['quantity'] * item['price'] for item in items)
    
    # Add total row
    items_data.append(['', '', 'Total:', f"${total_amount:.2f}"])
    
    # Create the table with the data
    items_table = Table(items_data, colWidths=[2.5*inch, 1*inch, 1.25*inch, 1.25*inch])
    
    # Style the table
    items_table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.darkblue),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        
        # Grid lines
        ('GRID', (0, 0), (-1, -2), 0.5, colors.grey),
        
        # Align numbers right
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        
        # Total row styling
        ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(items_table)
    
    # Add footer notes
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("Thank you for your business!", normal_style))
    elements.append(Spacer(1,.1*inch))
    # elements.append(Paragraph("Payment Terms: Due within 30 days.", normal_style))
    
    # Build the document with our elements
    doc.build(elements)
    
    # Reset buffer position to the beginning
    buffer.seek(0)
    
    # Return binary PDF data
    return buffer.read()

"""
# E-posta Gönderme Fonksiyonu (Mock Server ile)
def send_invoice_email(to_email, file_path):
    from_email = "mockmail@example.com"  # İstediğin bir sahte adres
    subject = "Your Invoice (Mock)"
    
    # E-posta mesajı oluştur
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    body = "Please find attached your invoice. (This is a mock email.)"
    msg.attach(MIMEBase('text', 'plain'))  # E-mail body boş kalmasın diye
    
    # PDF dosyasını ekle
    part = MIMEBase('application', 'octet-stream')
    with open(file_path, 'rb') as file:
        part.set_payload(file.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', f"attachment; filename={file_path}")
    msg.attach(part)

    # Mock SMTP Server ayarları (örneğin MailHog)
    with smtplib.SMTP('localhost', 1025) as server:
        # Gerçek SMTP sunucularında starttls() ve login gerekir
        # Mock server'da gerek yok!
        server.sendmail(from_email, to_email, msg.as_string())

"""
# E-posta Gönderme Fonksiyonu (Blob veriyle)
def send_invoice_email(to_email, pdf_data):
    from_email = "orders@odysseybooks.com"
    subject = "Your Invoice (Mock)"

    # E-posta mesajı oluştur
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    # Body ekle
    body = MIMEText("Please find attached your invoice. (This is a mock email.)", 'plain')
    msg.attach(body)

    # PDF dosyasını ekle
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(pdf_data)  # ARTIK file_path değil, doğrudan pdf_data (bytes)
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment; filename="invoice.pdf"')
    msg.attach(part)

    # MailHog üzerinden gönder
    with smtplib.SMTP('mailhog', 1025) as server:
        server.sendmail(from_email, to_email, msg.as_string())

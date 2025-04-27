
""""
import requests
import json
from auth_test import login
from config import BASEURL as BASE_URL, HEADERS

def add_to_cart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "quantity": quantity}
    response = requests.post(f"{BASE_URL}/shopping/add", json=data, headers=headers)
    return response.json() if response.status_code == 200 else {"error": response.json(), "status_code": response.status_code, "details": response.json()}

def view_cart(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/shopping/view", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to view cart", "status_code": response.status_code}

def clear_cart(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.delete(f"{BASE_URL}/shopping/clear", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to clear cart", "status_code": response.status_code}

def removefromcart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "quantity": quantity}
    response = requests.post(f"{BASE_URL}/shopping/remove", json=data, headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to remove product from cart", "status_code": response.status_code}

def create_order(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.post(f"{BASE_URL}/payment/create_order", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to create order", "status_code": response.status_code, "details": response.json()}

def generate_invoice(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.post(f"{BASE_URL}/invoice/generate_invoice", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to generate invoice", "status_code": response.status_code, "details": response.json()}

def get_invoice(token, invoice_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/invoice/get_invoice_pdf/{invoice_id}", headers=headers)
    return response

def send_invoice_email_request(token, to_email, file_path):
    url = f"{BASE_URL}/invoice/send_invoice_email"
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "to_email": to_email,
        "file_path": file_path
    }
    response = requests.post(url, json=data, headers=headers)
    return response

def view_orders(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/order/view_order_history", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to fetch order history", "status_code": response.status_code, "details": response.json()}

def save_pdf(pdf_data, filename="invoice.pdf"):
    with open(filename, "wb") as f:
        f.write(pdf_data)
    print(f"PDF saved as {filename}")

def update_user_profile(token):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "payment_method": "Credit Card",
        "home_address": "Test Mahallesi, Test Sokak No:1, İstanbul"
    }
    response = requests.put(f"{BASE_URL}/user/update_profile", json=data, headers=headers)
    if response.status_code == 200:
        print("User profile updated successfully!")
    else:
        print(f"Failed to update user profile: {response.status_code}, {response.text}")

if __name__ == "__main__":
    # Step 1: Login
    customer_login1 = login("customer@example.com", "password")
    customer_token = customer_login1.get("access_token")

    if not customer_token:
        print("Failed to log in as customer.")
        exit()
    print("Customer logged in successfully!")

    # Step 2: Update user profile (payment method + address)
    update_user_profile(customer_token)

    # Step 3: Add products to cart
    print("Adding products to cart...")
    add_to_cart(customer_token, product_id=4, quantity=2)

    # Step 4: View cart
    print("Viewing cart...")
    cart = view_cart(customer_token)
    print("Cart contents:", cart)

    # Step 5: Create order
    print("Creating an order...")
    order = create_order(customer_token)
    print("Order created:", order)

    # Step 6: Generate invoice
    print("Generating invoice...")
    invoice_response = generate_invoice(customer_token)
    print("Invoice response:", invoice_response)

    if "invoice_id" not in invoice_response:
        print("Invoice creation failed. Cannot proceed.")
        exit()

    invoice_id = invoice_response["invoice_id"]

    # Step 7: Download invoice PDF
    print("Fetching invoice PDF...")
    pdf_response = get_invoice(customer_token, invoice_id)
    save_pdf(pdf_response.content, f"invoice_{invoice_id}.pdf")

    # Step 8: Send invoice email (Mock Server through endpoint)
    print("Sending invoice email through endpoint...")
    email_response = send_invoice_email_request(
        customer_token,
        to_email="testreceiver@example.com",
        file_path=f"invoice_{invoice_id}.pdf"
    )

    if email_response.status_code == 200:
        print("Invoice email sent successfully!")
    else:
        print(f"Failed to send invoice email: {email_response.json()}")

    # Step 9: View order history
    print("Viewing order history...")
    orders = view_orders(customer_token)
    print("Order history:", orders)

"""
import requests
from auth_test import login
from config import BASEURL as BASE_URL, HEADERS

def add_to_cart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "quantity": quantity}
    return requests.post(f"{BASE_URL}/shopping/add", json=data, headers=headers)

def update_user_profile(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "payment_method": "Credit Card",
        "home_address": "Test Mahallesi, Test Sokak No:1, İstanbul"
    }
    return requests.put(f"{BASE_URL}/user/update_profile", json=data, headers=headers)

def create_order(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    return requests.post(f"{BASE_URL}/payment/create_order", headers=headers)

def get_invoice(token, invoice_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    return requests.get(f"{BASE_URL}/invoice/get_invoice_pdf/{invoice_id}", headers=headers)

def send_invoice_email(token, to_email, file_path):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "to_email": to_email,
        "file_path": file_path
    }
    return requests.post(f"{BASE_URL}/payment/send_invoice_email", json=data, headers=headers)

def save_pdf(pdf_data, filename):
    with open(filename, "wb") as f:
        f.write(pdf_data)
    print(f"PDF saved as {filename}")

def send_invoice_email(token, to_email, invoice_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "to_email": to_email,
        "invoice_id": invoice_id  # artık file_path değil, invoice_id yolluyorsun
    }
    return requests.post(f"{BASE_URL}/payment/send_invoice_email", json=data, headers=headers)



if __name__ == "__main__":
    # Step 1: Login
    login_response = login("customer@example.com", "password")
    customer_token = login_response.get("access_token")

    if not customer_token:
        print("❌ Failed to login.")
        exit()
    print("✅ Logged in!")

  


    # Step 3: Add product to cart
    add_response = add_to_cart(customer_token, product_id=4, quantity=1)
    if add_response.status_code == 200:
        print("✅ Product added to cart.")
    else:
        print("❌ Failed to add product.")
        exit()

    # Step 4: Create order (which creates invoice automatically)
    order_response = create_order(customer_token)
    if order_response.status_code != 200:
        print("❌ Failed to create order.")
        exit()
    
    order_data = order_response.json()
    invoice_id = order_data.get("invoice_id")
    if not invoice_id:
        print("❌ No invoice ID returned.")
        exit()
    
    print(f"✅ Order created, Invoice ID: {invoice_id}")

    # Step 5: Get invoice PDF
    invoice_response = get_invoice(customer_token, invoice_id)
    if invoice_response.status_code == 200:
        invoice_file = f"invoice_{invoice_id}.pdf"
        save_pdf(invoice_response.content, invoice_file)
    else:
        print("❌ Failed to fetch invoice PDF.")
        exit()

    
    # Step 6: Send invoice email using the payment/send_invoice_email endpoint
    email_response = send_invoice_email(customer_token, "customer@example.com", invoice_id)



    if email_response.status_code == 200:
        print("✅ Invoice email sent successfully!")
    else:
        print(f"❌ Failed to send invoice email: {email_response.text}")

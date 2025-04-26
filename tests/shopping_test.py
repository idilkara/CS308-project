from config import BASEURL as BASE_URL, HEADERS
import requests
import json
from auth_test import login 
from invoice import send_invoice_email  



def add_to_cart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "quantity": quantity}
    response = requests.post(f"{BASE_URL}/shopping/add", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.json(), "status_code": response.status_code, "details": response.json()}

def view_cart(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/shopping/view", headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to view cart", "status_code": response.status_code}

def clear_cart(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    
    # Change the request method to DELETE
    response = requests.delete(f"{BASE_URL}/shopping/clear", headers=headers)
    
    if response.status_code == 200:
        return response.json()  # Return the success response from the API
    return {"error": "Failed to clear cart", "status_code": response.status_code}

def removefromcart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
        
    # Prepare the data to send in the request body (JSON)
    data = {
        "product_id": product_id,
        "quantity": quantity
    }

    # Send a POST request to the remove from cart endpoint
    response = requests.post(f"{BASE_URL}/shopping/remove", json=data, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to remove product from cart", "status_code": response.status_code}



def create_order(token):
    print("cr order")
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    
    # Send a POST request to the create_order endpoint
    response = requests.post(f"{BASE_URL}/payment/create_order", headers=headers)
    
    # Check if the response was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        print("cr order is a problem")
        return {"error": "Failed to create order", "status_code": response.status_code, "details": response.json()}

def get_invoice(token, invoice_id):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/invoice/get_invoice_pdf/{invoice_id}", headers=headers)

    return response

def view_orders(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    
    # Send a GET request to the view_order_history endpoint
    response = requests.get(f"{BASE_URL}/order/view_order_history", headers=headers)
    
    # Check if the response was successful
    if response.status_code == 200:
        return response.json()  # Return the order history from the API
    else:
        return {"error": "Failed to fetch order history", "status_code": response.status_code, "details": response.json()}
    
    
if __name__ == "__main__":
    # Step 1: Login as a customer
    customer_login1 = login("customer@example.com", "password")
    customer_token = customer_login1.get("access_token")
    if not customer_token:
        print("Failed to log in as customer")
        exit()
    print("Customer logged in successfully!")

    # Step 2: Add products to the cart
    print("Adding products to cart...")
    add_to_cart(customer_token, product_id=7, quantity=2)
    add_to_cart(customer_token, product_id=4, quantity=1)
    add_to_cart(customer_token, product_id=3, quantity=5)
    print("Products added to cart successfully!")

    # Step 3: View the cart
    print("Viewing cart...")
    cart = view_cart(customer_token)
    print("Cart contents:", cart)

    # Step 4: Remove a product from the cart
    print("Removing a product from cart...")
    removefromcart(customer_token, product_id=13, quantity=1)
    print("Product removed from cart successfully!")

    # Step 5: Clear the cart
    print("Clearing the cart...")
    clear_cart(customer_token)
    print("Cart cleared successfully!")
"""
    # Step 6: Add products again and create an order
    print("Adding products to cart again...")
    add_to_cart(customer_token, product_id=4, quantity=2)
    add_to_cart(customer_token, product_id=3, quantity=1)

    print("Creating an order...")
    order = create_order(customer_token)
    print("Order created:", order)

    def save_pdf(pdf_data, filename="invoice.pdf"):
        with open(filename, "wb") as f:
            f.write(pdf_data)
        print(f"PDF saved as {filename}")

    # # Example usage:
    # pdf = get_invoice(customer_token, order["invoice_id"])  # Fetch the PDF
    # save_pdf(pdf.content)


    # Step 6.5: Get invoice and send it by email (mock)
    print("Fetching invoice PDF and sending email...")
    pdf_response = get_invoice(customer_token, order["invoice_id"])  # Fetch the PDF
    save_pdf(pdf_response.content, "invoice.pdf")                    # Save the PDF locally

    
    send_invoice_email("testreceiver@example.com", "invoice.pdf")     # Send the email
    print("Mock email sent successfully!")


    # Step 7: View order history
    print("Viewing order history...")
    orders = view_orders(customer_token)
    print("Order history:", orders)

"""
print("Adding products to cart again...")
add_to_cart(customer_token, product_id=1, quantity=2)  # Güvenli ürün ID

print("Viewing cart after adding products...")
cart = view_cart(customer_token)
print("Cart contents after adding:", cart)

print("Creating an order...")
order = create_order(customer_token)
print("Order created:", order)

if "invoice_id" not in order:
    print("Order creation failed. Cannot proceed to fetch invoice.")
    exit()

# Step 6.5: Get invoice and send it by email (mock)
print("Fetching invoice PDF and sending email...")
pdf_response = get_invoice(customer_token, order["invoice_id"])  # Fetch the PDF
save_pdf(pdf_response.content, "invoice.pdf")                    # Save the PDF locally

send_invoice_email("testreceiver@example.com", "invoice.pdf")     # Send the email
print("Mock email sent successfully!")

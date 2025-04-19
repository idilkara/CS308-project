#auth
#product
from config import BASEURL as BASE_URL, HEADERS
import requests
import json
from auth_test import login 




def view_orders_pm(token):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    
    # Send a GET request to the view_order_history endpoint
    response = requests.get(f"{BASE_URL}/delivery/view_orders", headers=headers)
    
    # Check if the response was successful
    if response.status_code == 200:
        return response.json()  # Return the order history from the API
    else:
        return {"error": "Failed to fetch waiting producsts", "status_code": response.status_code, "details": response.json()}
    
def deliver_orders_pm(token, orderitem_id,newstat):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}

    # Prepare the data to send in the request body (JSON)
    data = {
        "status": newstat,

    }

    # Send a POST request to the remove from cart endpoint
    response = requests.put(f"{BASE_URL}/delivery/update_status/{orderitem_id}", json=data, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to update status", "status_code": response.status_code}
    
def view_orderitem (token, orderitem_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}

    response = requests.get(f"{BASE_URL}/order/view_orderitem/{orderitem_id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to view orderitem", "status_code": response.status_code}

def generate_invoice(token, orderitem_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.post(f"{BASE_URL}/shopping/generate_invoice", headers=headers)

    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to generate invoice", "status_code": response.status_code}


    

if __name__ == "__main__":
    # Step 1: Login as a product manager and a customer
    pm_login = login("pm@example.com", "password")
    pm_token = pm_login.get("access_token")
    idilToken = login("idil.kara@sabanciuniv.edu", "12312312")

    cm_login = login("customer@example.com", "password")
    cm_token = cm_login.get("access_token")

    cm_token = idilToken.get("access_token")
    
    if not pm_token:
        print("Failed to log in as product manager")
        exit()
    if not cm_token:
        print("Failed to log in as customer")
        exit()

    print("Product manager and customer logged in successfully.")

    
    # Step 2: Customer places an order
    print("Customer is placing an order...")
    headers = {"Authorization": f"Bearer {cm_token}", **HEADERS}
    checkout_data = {
        "delivery_address": "123 Main Street, Test City",
        "items": [
            {"product_id": 19, "quantity": 1},
            {"product_id": 15, "quantity": 2}
        ]
    }
    response = requests.post(f"{BASE_URL}/order/checkout", json=checkout_data, headers=headers)

    if response.status_code == 201:
        print("Order placed successfully:", response.json())
    else:
        print("Failed to place order:", response.status_code)
        try:
            print("Error response:", response.json())
        except ValueError:
            print("Raw response:", response.text)


    # Step 3: View all orders as product manager (delivery role)
    print("Viewing orders for product manager...")
    orders = view_orders_pm(pm_token)
    print("Orders:", orders)

    # Step 4: Update the status of order items
    print("Updating order item #1 to 'in-transit'...")
    update_response = deliver_orders_pm(pm_token, 1, "in-transit")
    print("Update response:", update_response)

    print("Updating order item #2 to 'delivered'...")
    update_response = deliver_orders_pm(pm_token, 2, "delivered")
    print("Update response:", update_response)

    # Step 5: View updated orders again
    print("Viewing orders for product manager after updates...")
    orders = view_orders_pm(pm_token)
    print("Orders:", orders)

    # Step 6: View order item details as customer
    print("Viewing order item #1 details...")
    orderitem = view_orderitem(cm_token, 1)
    print("Order item:", orderitem)

    print("Viewing order item #2 details...")
    orderitem = view_orderitem(cm_token, 2)
    print("Order item:", orderitem)

    print("generating invoice...")
    invoice = generate_invoice(cm_token, 1)
    print("Invoice:", invoice)
   



from config import BASEURL , HEADERS
import requests
import json
from auth_test import login 
from product_test import viewproducts 

from shopping_test import add_to_cart
from shopping_test import create_order
from product_test import viewproducts, viewproduct


def view_orders(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASEURL}/order/view_order_history", headers=headers)
    return response.json() if response.status_code == 200 else {"error": "Failed to fetch order history", "status_code": response.status_code, "details": response.json()}


def addTowishlist(token, product_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id}
    response = requests.post(f"{BASEURL}/wishlist/add", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to add to wishlist", "status_code": response.status_code}


def set_discount(token, product_id, discount_amount):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "product_id": product_id,
        "discount_amount": discount_amount
    }
    response = requests.put(f"{BASEURL}/discounts/setdiscount", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to set discount", "status_code": response.status_code}


def get_notification(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASEURL}/notification/notificationsofuser", headers=headers)    

    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to get notification", "status_code": response.status_code}


if __name__ == "__main__":

    # login

    products = viewproducts()

    customer_login1 = login("customer@example.com", "password")
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")

    # Ensure login success
    customer_token = customer_login1.get("access_token")

    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")


    print(addTowishlist(customer_token, 2))  # Add product with ID 1 to wishlist
    
    set_discount(sm_token, 2, 0.2)  # Set a discount of 20% for product with ID 1

    print("Discount set successfully!")
    notif = get_notification(customer_token)
    print("Notification: ", notif)  # Get notifications for the customer

    # print(viewproducts())  # View all products
    print(viewproduct(2))  # View details of product with ID 1
    add_to_cart(customer_token, 2, 1)  # Add product with ID 1 to cart with quantity 2
    add_to_cart(customer_token, 3, 2)  # Add product with ID 1 to cart with quantity 2
    print("Product added to cart successfully!")
    order = create_order(customer_token)  # Create an order for product with ID 1
    print("Order created successfully!")

    orders =  view_orders(customer_token)  # View order history for the customer
    print("Order details: ", orders)  # Print order details
    

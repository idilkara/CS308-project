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
    


if __name__ == "__main__":
    # Step 1: Login as a product manager
    pm_login = login("pm@example.com", "password")
    pm_token = pm_login.get("access_token")

    cm_login = login("customer@example.com", "password")
    cm_token = cm_login.get("access_token")
    if not pm_token:
        print("Failed to log in as product manager")
        exit()
    print("Product manager logged in successfully!")

    # Step 2: View all orders for the product manager
    print("Viewing orders for product manager...")
    orders = view_orders_pm(pm_token)
    print("Orders:", orders)


    # Update the status to "in-transit"
    update_response = deliver_orders_pm(pm_token, 1, "in-transit")
    print("Update response:", update_response)

    # Update the status to "delivered"
    update_response = deliver_orders_pm(pm_token, 2, "delivered")
    print("Update response:", update_response)
    

    # Step 2: View all orders for the product manager
    print("Viewing orders for product manager...")
    orders = view_orders_pm(pm_token)
    print("Orders:", orders)

    # Step 3: View order item details
    print("Viewing order item details...")
    orderitem = view_orderitem(cm_token, 1)
    print("Order item:", orderitem)
    print("Viewing order item details...")
    orderitem = view_orderitem(cm_token, 2)
    print("Order item:", orderitem)

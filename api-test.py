import requests
import json

BASE_URL = "http://localhost:5001"
HEADERS = {"Content-Type": "application/json"}

def register_user(name, email, password, role, company_id=None, home = None):
    data = {"name": name, "email": email, "password": password, "role": role, "home_address": home}
    if company_id:
        data["company_id"] = company_id
    response = requests.post(f"{BASE_URL}/auth/register", json=data, headers=HEADERS)
    return response.json()

def login(email, password):
    data = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/auth/login", json=data, headers=HEADERS)
    return response.json()

def create_product(token, name, model, description, stock_quantity, distributor_information, categories):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "name": name,
        "model": model,
        "description": description,
        "stock_quantity": stock_quantity,
        "distributor_information": distributor_information,
        "categories": categories,
    }
    response = requests.post(f"{BASE_URL}/pm_products/product/create", json=data, headers=headers)
    if response.status_code == 201 :
        return response.json()
    return {"error": "Failed to create product", "status_code": response.status_code}

def update_price(token, product_id, price):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"price": price}
    response = requests.put(f"{BASE_URL}/sm/update_price/{product_id}", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to update price", "status_code": response.status_code}

def add_to_cart(token, product_id, quantity):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "quantity": quantity}
    response = requests.post(f"{BASE_URL}/shopping/add", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to add to cart", "status_code": response.status_code}

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
    response = requests.get(f"{BASE_URL}/shopping/remove", headers=headers)

        
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
    log = []

    # Register users
    customer_resp = register_user("Customer", "customer@example.com", "password", "customer", home="home")
    pm_resp = register_user("Product Manager", "pm@example.com", "password", "product_manager", company_id=1)
    sm_resp = register_user("Sales Manager", "sm@example.com", "password", "sales_manager", company_id=1)
    
    log.append({"Register": {"customer": customer_resp, "pm": pm_resp, "sm": sm_resp}})

    # Login users
    customer_login = login("customer@example.com", "password")
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")

    # Ensure login success
    customer_token = customer_login.get("access_token")
    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")

    if not all([customer_token, pm_token, sm_token]):
        log.append({"error": "Login failed for one or more users"})
    else:
        # Product manager adds a product
        product_response = create_product(pm_token, "Laptop", "X123", "Powerful laptop", 10, "Distributor A", ["Electronics"])
        log.append(product_response)

        product_id = product_response.get("product_id")
        if product_id:
            # Sales manager updates the price
            price_update_resp = update_price(sm_token, product_id, 1500)
            log.append(price_update_resp)

            # Ensure price update is successful before adding to cart
            if "error" not in price_update_resp:
                cart_resp = add_to_cart(customer_token, product_id, 3)
                log.append(cart_resp)
                log.append(view_cart(customer_token))


                remov_resp = removefromcart(customer_token, product_id,  1)

                log.append(remov_resp)
                log.append(view_cart(customer_token))


                remov_resp = removefromcart(customer_token, product_id,  2)

                log.append(remov_resp)
                log.append(view_cart(customer_token))

                clear_resp = clear_cart (customer_token)
                log.append(clear_resp)
                log.append(view_cart(customer_token))


                cart_resp = add_to_cart(customer_token, product_id, 3)
                log.append(cart_resp)
                log.append(view_cart(customer_token))

                # turn this into an order 
                pay_resp = create_order(customer_token)
                log.append(pay_resp)
                log.append(view_cart(customer_token))
                log.append(view_orders(customer_token))


            else:
                log.append({"error": "Price update failed, skipping add-to-cart"})

    # Print logs
    for entry in log:
        print(entry)
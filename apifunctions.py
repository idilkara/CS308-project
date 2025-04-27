import requests
import json

BASE_URL = "http://localhost:5001"
HEADERS = {"Content-Type": "application/json"}

def register_user(name, email, password, role, company_id=None):
    data = {"name": name, "email": email, "password": password, "role": role}
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
    if response.status_code == 200:
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

if __name__ == "__main__":
    log = []
    
    # Register users
    log.append(register_user("Customer", "customer@example.com", "password", "customer"))
    log.append(register_user("Product Manager", "pm@example.com", "password", "product_manager", company_id=1))
    log.append(register_user("Sales Manager", "sm@example.com", "password", "sales_manager", company_id=1))
    
    # Login users
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")
    customer_login = login("customer@example.com", "password")
    
    # Ensure login success
    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")
    customer_token = customer_login.get("access_token")
    
    if pm_token and sm_token and customer_token:
        # Product manager adds a product
        product_response = create_product(pm_token, "Laptop", "X123", "Powerful laptop", 10, "Distributor A", ["Electronics"])
        log.append(product_response)
        product_id = product_response.get("product_id")
        
        if product_id:
            # Sales manager assigns a price
            log.append(update_price(sm_token, product_id, 1500))
            
            # Customer adds product to cart
            log.append(add_to_cart(customer_token, product_id, 1))
            
            # View shopping cart
            log.append(view_cart(customer_token))
    else:
        log.append({"error": "Login failed for one or more users", "pm_login": pm_login, "sm_login": sm_login, "customer_login": customer_login})
    
    # Print log
    print(json.dumps(log, indent=4))

import requests
import json

BASE_URL = "http://localhost:5001"
HEADERS = {"Content-Type": "application/json"}

def register_user(name, email, password, role, company_id=None, home=None):
    data = {"name": name, "email": email, "password": password, "role": role, "home_address": home}
    if company_id:
        data["company_id"] = company_id
    response = requests.post(f"{BASE_URL}/auth/register", json=data, headers=HEADERS)
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

def login(email, password):
    data = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/auth/login", json=data, headers=HEADERS)
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

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
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

def add_review(token, product_id, rating, comment):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "rating": rating, "comment": comment}
    response = requests.post(f"{BASE_URL}/reviews/add", json=data, headers=headers)
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

def get_reviews(product_id):
    response = requests.get(f"{BASE_URL}/reviews/product/{product_id}", headers=HEADERS)
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

def approve_review(token, review_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.put(f"{BASE_URL}/reviews/approve/{review_id}", headers=headers)
    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Error decoding JSON: {response.status_code} - {response.text}")
        return {"error": "Failed to decode JSON response"}

if __name__ == "__main__":
    print("Running API tests...")
    log = []

    # Register and login as a customer
    print("Registering customer...")
    customer_resp = register_user("Test User", "new_customer@example.com", "test123", "customer")
    log.append({"info": "Customer registration response", "response": customer_resp})

    user_login = login("new_customer@example.com", "test123")
    user_token = user_login.get("access_token")
    log.append({"info": "Customer login response", "response": user_login})

    if not user_token:
        log.append({"error": "Customer login failed"})
        print("Customer login failed. Exiting...")
    else:
        print("Customer logged in successfully.")

    # Register and login as a product manager
    print("Registering Product Manager...")
    pm_resp = register_user("PM User", "new_pm@example.com", "pm123", "product_manager", company_id=8)
    log.append({"info": "Product Manager registration response", "response": pm_resp})

    pm_login = login("new_pm@example.com", "pm123")
    pm_token = pm_login.get("access_token")
    log.append({"info": "Product Manager login response", "response": pm_login})

    if not pm_token:
        log.append({"error": "Product Manager login failed"})
        print("Product Manager login failed. Exiting...")
    else:
        print("Product Manager logged in successfully.")

    # Print logs
    print("\nLogs:")
    for entry in log:
        print(json.dumps(entry, indent=2))

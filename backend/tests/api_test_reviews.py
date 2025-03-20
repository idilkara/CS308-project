import requests
import json
###  "error": "Product Manager login failed"
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
    register_user("Test User", "test@example.com", "test123", "customer")
    user_login = login("test@example.com", "test123")
    user_token = user_login.get("access_token")
    log.append({"info": "User logged in", "token": user_token})

    # Register and login as a product manager
    register_user("PM User", "pm@example.com", "pm123", "product_manager", company_id=1)
    pm_login = login("pm@example.com", "pm123")
    pm_token = pm_login.get("access_token")
    log.append({"info": "Product Manager logged in", "token": pm_token})

    if not pm_token:
        log.append({"error": "Product Manager login failed"})
    else:
        # Create a product
        product = create_product(pm_token, "Test Product", "Model X", "Description", 100, "Distributor Info", ["Category1"])
        product_id = product.get("product_id")
        log.append({"info": "Product created", "product": product})

        # Add a review
        review_resp = add_review(user_token, product_id, 5, "Great product!")
        log.append({"info": "Add review response", "response": review_resp})

        # Get reviews
        reviews = get_reviews(product_id)
        log.append({"info": "Product reviews", "reviews": reviews})

        # Approve review
        review_id = review_resp.get("review_id")
        approve_resp = approve_review(pm_token, review_id)
        log.append({"info": "Review approval response", "response": approve_resp})

    # Print logs
    for entry in log:
        print(json.dumps(entry, indent=2))

import requests
import json
from shopping_test import add_to_cart, create_order
from order_test import deliver_orders_pm


BASE_URL = "http://localhost:5001"
HEADERS = {"Content-Type": "application/json"}

def login(email, password):
    data = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/auth/login", json=data, headers=HEADERS)
    return response.json()

def add_review(token, product_id, rating, comment):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"product_id": product_id, "rating": rating, "comment": comment}
    response = requests.post(f"{BASE_URL}/reviews/add", json=data, headers=headers)
    return response.json()


def view_unapproved_reviews(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASE_URL}/reviews/unapproved", headers=headers)
    print("Unapproved reviews response:", response.status_code)
    return response.json()


def approve_review(token, review_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.put(f"{BASE_URL}/reviews/approve/{review_id}", headers=headers)
    return response.json()

def delete_review(token, review_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.delete(f"{BASE_URL}/reviews/remove/{review_id}", headers=headers)
    return response.json()

def get_reviews(product_id):
    response = requests.get(f"{BASE_URL}/reviews/product/{product_id}", headers=HEADERS)
    return response.json()

if __name__ == "__main__":
    print("Logging in users...")
    cm_login = login("customer@example.com", "password")
    pm_login = login("pm@example.com", "password")
    cm_token = cm_login.get("access_token")
    pm_token = pm_login.get("access_token")

    if not cm_token or not pm_token:
        print("Login failed for one or both users. Exiting.")
        exit()

    print("Users logged in successfully.")

    product_id = 1

    # ADD TO CART , PURCHASE IT 
    addResponse = add_to_cart(cm_token, product_id, 1)
    print("Add to cart response:", addResponse)
    order_resp = create_order(cm_token)
    print("Order response:", order_resp)

    update_response = deliver_orders_pm(pm_token, 1, "delivered")
    print(f"Submitting review for product {product_id}...")
    review_resp = add_review(cm_token, product_id, rating=4, comment="Product arrived on time and was high quality.")
    print("Review response:", review_resp)

    review_id = review_resp.get("review_id")
    if not review_id:
        print("Review was not created. Ensure the product was delivered before submitting a review.")
        exit()

    print("Fetching unapproved reviews...")
    unapproved_reviews = view_unapproved_reviews(pm_token)
    print("Unapproved reviews:")

    print(unapproved_reviews)

    print("Approving review as product manager...")
    approval = approve_review(pm_token, review_id)
    print("Approval response:", approval)

    print("Fetching approved reviews for the product...")
    reviews = get_reviews(product_id)
    print("Approved reviews:")
    print(json.dumps(reviews, indent=2))

    # 
    print("Deleting review...")
    delete_response = delete_review(pm_token, review_id)
    print("Delete response:", delete_response)
    print("Fetching reviews after deletion...")
    reviews_after_deletion = get_reviews(product_id)
    print("Reviews after deletion:")
    print(json.dumps(reviews_after_deletion, indent=2))
    print("Test completed.")




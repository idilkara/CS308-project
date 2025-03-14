import requests

BASE_URL = "http://localhost:5001"

# Login
login_data = {
    "email": "testuser@example.com",
    "password": "testpassword"
}
response = requests.post(f"{BASE_URL}/auth/login", json=login_data)

if response.status_code == 200:
    token = response.json().get("token")
    print("Login successful. Token:", token)
else:
    print("Login failed")
    exit()

# View products
headers = {"Authorization": f"Bearer {token}"}
products = requests.get(f"{BASE_URL}/products", headers=headers)
print("Products:", products.json())

# Add product to cart
add_cart_data = {"product_id": 2, "quantity": 1}
cart_response = requests.post(f"{BASE_URL}/shopping/add", headers=headers, json=add_cart_data)
print("Cart Response:", cart_response.json())

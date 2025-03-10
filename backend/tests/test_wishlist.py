import unittest
import requests
from flask_jwt_extended import create_access_token

BASE_URL = "http://localhost:5000"
WISHLIST_URL = f"{BASE_URL}/wishlist"
AUTH_URL = f"{BASE_URL}/auth"

class TestWishlistEndpoints(unittest.TestCase):

    def setUp(self):
        # User details
        self.username = "testuser"
        self.email = "testuser@example.com"
        self.password = "testpassword"
        self.name = "Test User"
        self.home_address = "123 Test St"
        self.role = "customer"

        # Try to log in first
        try:
            self.token = self.login_user(self.email, self.password)
        except AssertionError:
            # If login fails, register the user
            self.register_user(self.name, self.email, self.password, self.home_address, self.role)
            self.token = self.login_user(self.email, self.password)

        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.product_ids = [1, 3, 4, 5]  # Assuming these product IDs exist

    def register_user(self, name, email, password, home_address, role):
        payload = {
            "name": name,
            "email": email,
            "password": password,
            "home_address": home_address,
            "role": role
        }
        response = requests.post(f"{AUTH_URL}/register", json=payload)
        if response.status_code != 201:
            print("Registration failed:", response.json())
        self.assertEqual(response.status_code, 201)

    def login_user(self, email, password):
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{AUTH_URL}/login", json=payload)
        self.assertEqual(response.status_code, 200)
        return response.json()["access_token"]

    def test_view_wishlist(self):
        response = requests.get(f"{WISHLIST_URL}/view", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        wishlist_items = response.json()
        self.assertIsInstance(wishlist_items, list)

    def test_add_to_wishlist(self):
        for product_id in self.product_ids:
            payload = {
                "product_id": product_id
            }
            response = requests.post(f"{WISHLIST_URL}/add", headers=self.headers, json=payload)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["message"], "Product added to wishlist successfully!")

    def test_remove_from_wishlist(self):
        for product_id in self.product_ids:
            # First, add the product to the wishlist
            payload = {
                "product_id": product_id
            }
            requests.post(f"{WISHLIST_URL}/add", headers=self.headers, json=payload)

            # Then, remove the product from the wishlist
            payload = {
                "product_id": product_id
            }
            response = requests.post(f"{WISHLIST_URL}/remove", headers=self.headers, json=payload)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["message"], "Product removed from wishlist successfully!")

if __name__ == "__main__":
    unittest.main()
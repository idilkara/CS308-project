import unittest
import requests

BASE_URL = "http://localhost:5000"

class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        # This method will run before each test
        self.register_url = f"{BASE_URL}/auth/register"
        self.login_url = f"{BASE_URL}/auth/login"
        self.userinfo_url = f"{BASE_URL}/user/userinfo"
        self.delete_user_url = f"{BASE_URL}/user/delete"

        self.test_user = {
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "password",
            "home_address": "123 Test St",
            
            "role": "customer"
        }

    def test_register_user(self):
        response = requests.post(self.register_url, json=self.test_user)
        self.assertEqual(response.status_code, 201)
        self.assertIn("message", response.json())
        self.assertEqual(response.json()["message"], "User registered successfully!")

    def test_login_user(self):
        # First, register the user
        requests.post(self.register_url, json=self.test_user)

        # Then, login with the same user
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        response = requests.post(self.login_url, json=login_data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.access_token = response.json()["access_token"]

    def test_user_info(self):
        # First, register and login the user
        requests.post(self.register_url, json=self.test_user)
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        response = requests.post(self.login_url, json=login_data)
        self.access_token = response.json()["access_token"]

        # Get user info
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(self.userinfo_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("user_id", response.json())
        self.assertEqual(response.json()["email"], self.test_user["email"])

    def test_delete_user(self):
        # First, register and login the user
        requests.post(self.register_url, json=self.test_user)
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        response = requests.post(self.login_url, json=login_data)
        self.access_token = response.json()["access_token"]

        # Get user info to get the user_id
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(self.userinfo_url, headers=headers)
        user_id = response.json()["user_id"]

        # Delete the user
        delete_url = f"{self.delete_user_url}/{user_id}"
        response = requests.delete(delete_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        self.assertEqual(response.json()["message"], f"User with user_id {user_id} deleted successfully!")

if __name__ == "__main__":
    unittest.main()
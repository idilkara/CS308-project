import unittest
import requests

BASE_URL = "http://localhost:5000/categories"

class TestCategoryEndpoints(unittest.TestCase):

    def setUp(self):
        self.categories_url = f"{BASE_URL}/categories"
        self.add_category_url = f"{BASE_URL}/addcategory"

    def test_get_categories(self):
        response = requests.get(self.categories_url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_add_category(self):
        data = {"name": "New Category"}
        response = requests.post(self.add_category_url, json=data)
        self.assertEqual(response.status_code, 201)
        self.assertIn("message", response.json())
        self.assertIn("category_id", response.json())

    def test_add_category_missing_name(self):
        data = {}
        response = requests.post(self.add_category_url, json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

if __name__ == "__main__":
    unittest.main()
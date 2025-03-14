import unittest
import requests

BASE_URL = "http://localhost:5000/products"

class TestProductEndpoints(unittest.TestCase):

    def setUp(self):
        self.product_id = None

    def test_create_product(self):
        payload = {
            "name": "Test Product",
            "model": "Test Model",
            "description": "This is a test product",
            "stock_quantity": 100,
            "price": 10.99,
            "categories": ["Test Category"]
        }
        response = requests.post(f"{BASE_URL}/product/create", json=payload)
        self.assertEqual(response.status_code, 201)
        self.product_id = response.json().get("product_id")
        self.assertIsNotNone(self.product_id)

    def test_get_product(self):
        if not self.product_id:
            self.test_create_product()
        response = requests.get(f"{BASE_URL}/product/info/{self.product_id}")
        self.assertEqual(response.status_code, 200)
        product = response.json()
        self.assertEqual(product["name"], "Test Product")
        self.assertEqual(product["description"], "This is a test product")
        self.assertEqual(product["price"], "10.99")

    def test_update_product(self):
        if not self.product_id:
            self.test_create_product()
        payload = {
            "name": "Updated Product",
            "model": "Updated Model",
            "description": "This is an updated test product",
            "stock_quantity": 150,
            "price": 12.99,
            "categories": ["Updated Category"]
        }
        response = requests.put(f"{BASE_URL}/product/update/{self.product_id}", json=payload)
        self.assertEqual(response.status_code, 200)
        updated_product = response.json()
        self.assertEqual(updated_product["message"], "Product updated successfully")


    def test_delete_product(self):
        if not self.product_id:
            self.test_create_product()
        response = requests.delete(f"{BASE_URL}/product/delete/{self.product_id}")
        self.assertEqual(response.status_code, 200)
        # Verify the product is deleted
        response = requests.get(f"{BASE_URL}/product/info/{self.product_id}")
        self.assertEqual(response.status_code, 404)

    def test_get_all_products(self):
        response = requests.get(f"{BASE_URL}/viewall")
        self.assertEqual(response.status_code, 200)
        products = response.json()
        self.assertIsInstance(products, list)

    def test_get_products_by_category(self):
        if not self.product_id:
            self.test_create_product()
        response = requests.get(f"{BASE_URL}/products/category/1")  # Assuming category ID 1 exists
        self.assertEqual(response.status_code, 200)
        products = response.json()
        self.assertIsInstance(products, list)

if __name__ == "__main__":
    unittest.main()
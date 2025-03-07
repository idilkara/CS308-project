import pytest
import json
from app import app  # Make sure this is your actual Flask app import

@pytest.fixture
def client():
    """Fixture to create a test client for Flask."""
    return app.test_client()

def test_create_product_success(client):
    # Prepare the payload for the POST request
    payload = {
        'name': 'Test Product',
        'model': 'TP-1234',
        'description': 'A product for testing',
        'stock_quantity': 100,
        'price': 19.99,
        'categories': ['Electronics', 'Accessories']
    }

    # Make the POST request to create the product
        # Make the POST request to create the product
    response = client.post('/products/create', json=payload)  # Ensure this matches the registered route
    
    print(app.url_map)  
    # Assert the response status code
    assert response.status_code == 201

    # Assert the response data contains the success message
    response_data = response.get_json()
    assert 'message' in response_data
    assert response_data['message'] == 'Product created successfully'
    assert 'product_id' in response_data



def test_get_all_products(client):
    # Make a GET request to the /viewall endpoint
    response = client.get('/products/viewall')
    
    # Assert the response status code is 200 OK
    assert response.status_code == 200
    
    # Parse the JSON response
    products = response.get_json()
    
    # Ensure the response is a list
    assert isinstance(products, list)
    
    # Ensure each product has the required keys
    for product in products:
        assert "product_id" in product
        assert "name" in product
        assert "price" in product
        assert "categories" in product
        
        # Ensure price is a string (from how it's cast in your code)
        assert isinstance(product["price"], str)
        # Ensure categories is either a list or empty
        assert isinstance(product["categories"], list)
        
    # Optional: You can add further checks to verify the data
    # For example, check that at least one product is returned
    assert len(products) > 0

def test_get_product_by_id_valid(client):
    # Assume product with ID 1 exists. You can replace this with a valid ID from your DB.
    product_id = 1
    
    # Make a GET request to the /info/<product_id> endpoint
    response = client.get(f'/products/info/{product_id}')
    
    # Assert the response status code is 200 OK
    assert response.status_code == 200
    
    # Parse the JSON response
    product = response.get_json()
    
    # Ensure the response has the correct keys
    assert "product_id" in product
    assert "name" in product
    assert "model" in product
    assert "description" in product
    assert "stock_quantity" in product
    assert "price" in product
    assert "categories" in product
    
    # Ensure price is a string (from how it's cast in your code)
    assert isinstance(product["price"], str)
    
    # Ensure categories is a list
    assert isinstance(product["categories"], list)
    
    # Optional: Verify specific data (for example, check the product name or price)
    assert product["product_id"] == product_id
    assert product["name"] != ""  # Ensure product has a name


def test_update_product_valid(client):
    # Assume product with ID 1 exists, replace with a valid ID in your DB
    product_id = 1
    
    # Prepare the payload for the PUT request
    payload = {
        "name": "Updated Product",
        "model": "UPD-1234",
        "description": "Updated description",
        "stock_quantity": 150,
        "price": 29.99,
        "categories": ["Electronics", "Accessories"]
    }

    # Make the PUT request to update the product
    response = client.put(f'/products/update/{product_id}', json=payload)
    
    # Assert the response status code is 200 OK
    assert response.status_code == 200
    
    # Parse the JSON response
    message = response.get_json()
    
    # Assert that the update was successful
    assert "message" in message
    assert message["message"] == "Product updated successfully"
    
    # Optional: Verify the data was updated (you can fetch the product again and check its details)
    response_check = client.get(f'/products/info/{product_id}')
    updated_product = response_check.get_json()
    
    # Check if the updated details match
    assert updated_product["name"] == payload["name"]
    assert updated_product["price"] == str(payload["price"])
    assert set(updated_product["categories"]) == set(payload["categories"])


def test_delete_product_valid(client):
    # Assume product with ID 1 exists (replace with a valid ID in your DB)
    product_id = 1
    
    # Make the DELETE request to delete the product
    response = client.delete(f'/products/delete/{product_id}')
    
    # Assert the response status code is 200 OK
    assert response.status_code == 200
    
    # Parse the JSON response
    message = response.get_json()
    
    # Assert the success message is returned
    assert "message" in message
    assert message["message"] == "Product deleted successfully"
    
    # Optional: Verify the product no longer exists
    response_check = client.get(f'/products/info/{product_id}')
    assert response_check.status_code == 404  # Product should not be found

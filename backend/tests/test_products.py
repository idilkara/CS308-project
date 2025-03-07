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
    response = client.post('/products/products', json=payload)

    # Assert the response status code
    assert response.status_code == 201

    # Assert the response data contains the success message
    response_data = response.get_json()
    assert 'message' in response_data
    assert response_data['message'] == 'Product created successfully'
    assert 'product_id' in response_data


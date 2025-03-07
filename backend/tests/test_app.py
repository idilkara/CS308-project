import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Example test for the root route
def test_hello_world(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"Hello, World!" in response.data

import pytest
import json
from app import app

@pytest.fixture
def client():
    """Fixture to create a test client for Flask."""
    return app.test_client()

# Test adding a user
def test_add_user(client):
    # Create test user data
    user_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "home_address": "123 Main St, Cityville",
        "role": "customer"
    }

    # Send a POST request to add the user (updated endpoint)
    response = client.post("/users/add", json=user_data)

    # Assert response status code and message
    assert response.status_code == 201
    assert response.json["message"] == "User added successfully!"

# Test showing all users
def test_show_users(client):
    # Send a GET request to show all users (updated endpoint)
    response = client.get("/users/show")

    # Assert the response status code is 200 (OK)
    assert response.status_code == 200
    assert isinstance(response.json, list)

    # Ensure expected fields exist in user data
    if response.json:
        user = response.json[0]
        expected_fields = {"user_id", "name", "email", "password", "home_address", "role"}
        assert expected_fields.issubset(user.keys())

# Test deleting a user
def test_delete_user(client):
    # First, add a user so we have an ID to delete
    user_data = {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "password": "password456",
        "home_address": "456 Another St, Townsville",
        "role": "sales_manager"
    }
    add_response = client.post("/users/add", json=user_data)
    assert add_response.status_code == 201  # Ensure user was created

    # Fetch all users to get the ID of the newly created user
    users_response = client.get("/users/show")
    assert users_response.status_code == 200
    users = users_response.json

    # Find the user_id for Jane Doe
    user_id = None
    for user in users:
        if user["email"] == "jane.doe@example.com":
            user_id = user["user_id"]
            break

    assert user_id is not None, "User ID not found in the database"

    # Send a DELETE request to remove the user (updated endpoint)
    delete_response = client.delete(f"/users/delete/{user_id}")

    # Assert the response status code and success message
    assert delete_response.status_code == 200
    assert delete_response.json["message"] == f"User with user_id {user_id} deleted successfully!"

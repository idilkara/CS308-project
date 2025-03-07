import pytest
import json
from app import app

# Test adding a user
def test_add_user():
    client = app.test_client()

    # Create the test data
    user_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "home_address": "123 Main St, Cityville",
        "role": "customer"
    }

    # Send a POST request to add the user
    response = client.post("/add-user", json=user_data)

    # Assert the response status code is 201 (Created)
    assert response.status_code == 201
    assert response.json["message"] == "User added successfully!"

# Test showing all users
def test_show_users():
    client = app.test_client()

    # Send a GET request to show all users
    response = client.get("/show-users")

    # Assert the response status code is 200 (OK)
    assert response.status_code == 200

    # Assert that the response is a list
    assert isinstance(response.json, list)

    # Make sure that users have the expected fields
    if response.json:
        user = response.json[0]
        assert "user_id" in user
        assert "name" in user
        assert "email" in user
        assert "password" in user
        assert "home_address" in user
        assert "role" in user

# Test deleting a user
def test_delete_user():
    client = app.test_client()

    # First, add a user to delete
    user_data = {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "password": "password456",
        "home_address": "456 Another St, Townsville",
        "role": "sales_manager"
    }
    add_response = client.post("/add-user", json=user_data)
    added_user = add_response.json  # Get the response of the added user

    # Get the user ID to delete (assuming the user ID is returned from DB or set by DB)
    user_id = 1  # This should be the ID of the user we want to delete. Modify accordingly.

    # Send a DELETE request to delete the user
    delete_response = client.delete(f"/delete-user/{user_id}")

    # Assert the response status code is 200 (OK)
    assert delete_response.status_code == 200
    assert delete_response.json["message"] == f"User with user_id {user_id} deleted successfully!"

from config import BASEURL , HEADERS
import requests
import json
from auth_test import login 


#@user_bp.route("/userinfo", methods=["GET"])

def get_user_info(token):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASEURL}/users/userinfo", headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to view cart", "status_code": response.status_code}

def edit_home_address(token, new_address):


    headers = {"Authorization": f"Bearer {token}", **HEADERS}

    response = requests.put(f"{BASEURL}/users/edit_address", json={"home_address": new_address}, headers=headers)

    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to edit address", "status_code": response.status_code}

def update_password(token, new_password ):

    headers = {"Authorization": f"Bearer {token}", **HEADERS}

    response = requests.put(f"{BASEURL}/users/update_password", json={"password": new_password}, headers=headers)

    if response.status_code == 200:
        return response.json()
    return {"error": "Failed UPDATE", "status_code": response.status_code}


if __name__ == "__main__":
    # Step 1: Login as a customer
    customer_login1 = login("customer@example.com", "newpassword")
    customer_token = customer_login1.get("access_token")
    if not customer_token:
        print("Failed to log in as customer")
        exit()
    print("Customer logged in successfully!")

    # Step 2: Get user info
    user_info = get_user_info(customer_token)
    if "error" in user_info:
        print("Failed to get user info:", user_info["error"])
    else:
        print("User info retrieved successfully:", json.dumps(user_info, indent=4))
    
    # Step 3: Edit home address
    new_address = "1NEW ADDERESy"
    edit_response = edit_home_address(customer_token, new_address)
    if "error" in edit_response:
        print("Failed to edit home address:", edit_response["error"])
    else:
        print("Home address updated successfully:", json.dumps(edit_response, indent=4))
    # Step 4: Get updated user info
    updated_user_info = get_user_info(customer_token)
    if "error" in updated_user_info:
        print("Failed to get updated user info:", updated_user_info["error"])
    else:
        print("Updated user info retrieved successfully:", json.dumps(updated_user_info, indent=4))

    newpass = "password"
    # Step 5: Update password
    update_response = update_password(customer_token, newpass)

    if "error" in update_response:  
        print("Failed to update password:", update_response["error"])
    else:
        print("Password updated successfully:", json.dumps(update_response, indent=4))

    # Step 6: login with new password

    customer_login1 = login("customer@example.com", newpass)
    customer_token2 = customer_login1.get("access_token")
    if not customer_token:
        print("Failed to log in as customer")
        exit()
    print("Customer logged in successfully!")

    updated_user_info = get_user_info(customer_token2)
    if "error" in updated_user_info:
        print("Failed to get updated user info:", updated_user_info["error"])
    else:
        print("Updated user info retrieved successfully:", json.dumps(updated_user_info, indent=4))
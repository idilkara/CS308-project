
from config import BASEURL , HEADERS
import requests
import json
from auth_test import login 
 

def get_invoice(token, invoice_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASEURL}/invoice/get_invoices", headers=headers)
    
    # Log the response status and content for debugging
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    
    if response.status_code == 200:
        try:
            return response.json()
        except requests.exceptions.JSONDecodeError:
            print("Error: Response is not valid JSON.")
            return {"error": "Invalid JSON response from server"}
    else:
        return {"error": f"Request failed with status code {response.status_code}"}
    


def get_invoice_manager(token, invoice_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.get(f"{BASEURL}/invoice/get_invoices_manager", headers=headers) 
    return response.json()


if __name__ == "__main__":

    customer_login1 = login("customer@example.com", "password")
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")

    customer_token = customer_login1.get("access_token")

    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")

    print(get_invoice(customer_token, 1))
    print("---------------------------------")
    print(get_invoice_manager(pm_token, 1))
    print("---------------------------------")
    print(get_invoice_manager(sm_token, 1))
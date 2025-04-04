from config import BASEURL , HEADERS
import requests
import json

def register_user(name, email, password, role, company_id=None, home = None):
    data = {"name": name, "email": email, "password": password, "role": role, "home_address": home}
    if company_id:
        data["company_id"] = company_id
    response = requests.post(f"{BASEURL}/auth/register", json=data, headers=HEADERS)
    return response.json()

def login(email, password):
    data = {"email": email, "password": password}
    response = requests.post(f"{BASEURL}/auth/login", json=data, headers=HEADERS)
    return response.json()



if __name__ == "__main__":

    #create a customer
    #create a customer without home
    #create a sales_manager
    #create a product_manager

    customer_resp1 = register_user("Customer", "customer@example.com", "password", "customer", home="home")
    customer_resp2 = register_user("homelessCustomer", "homelesscustomer@example.com", "password", "customer")
    pm_resp = register_user("Product Manager", "pm@example.com", "password", "product_manager", company_id=1)
    sm_resp = register_user("Sales Manager", "sm@example.com", "password", "sales_manager", company_id=1)

    print(customer_resp1, customer_resp2, pm_resp, sm_resp )

    # login

    customer_login1 = login("customer@example.com", "password")
    customer_login2 = login("homelesscustomer@example.com", "password")
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")

    # Ensure login success
    customer_token = customer_login1.get("access_token")
    customer_token2 = customer_login2.get("access_token")
    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")

    
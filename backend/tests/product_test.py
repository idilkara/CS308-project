from config import BASEURL , HEADERS
import requests
import json
from auth_test import login 



def create_product(token, name, model, description, stock_quantity, distributor_information, categories):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "name": name,
        "model": model,
        "description": description,
        "stock_quantity": stock_quantity,
        "distributor_information": distributor_information,
        "categories": categories,
    }
    response = requests.post(f"{BASEURL}/pm_products/product/create", json=data, headers=headers)
    if response.status_code == 201 :
        return response.json()
    return {"error": "Failed to create product", "status_code": response.status_code}



def update_price(token, product_id, price):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"price": price}
    response = requests.put(f"{BASEURL}/sm/update_price/{product_id}", json=data, headers=headers)
    if response.status_code == 200:

    
        return response.json()
    return {"error": "Failed to update price", "status_code": response.status_code}


def viewproducts ( ):

    response = requests.get(f"{BASEURL}/products/products")
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}


def viewcategories ():

    response = requests.get(f"{BASEURL}/categories/categories")
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}

def addcategory(token , name):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"name", name}
    response = requests.put(f"{BASEURL}/categories/addcategory", json=data, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}




def viewproducts_by_category ( categid):

    response = requests.get(f"{BASEURL}/products/products/category/{categid}")
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}


def viewproduct(prodid):
    response = requests.get(f"{BASEURL}/products/products/info/{prodid}")
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}




if __name__ == "__main__":


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

    # add products as a product manager

    # set prices to products as a sales_manager

    #view products

    #view categories 

    # create categroy

    # add category to product given product Id

    #view products given category 
    
    #view product info 





from config import BASEURL , HEADERS
import requests
import json
from auth_test import login 



def create_product(token, name, model, description, stock_quantity, distributor_information):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {
        "name": name,
        "model": model,
        "description": description,
        "stock_quantity": stock_quantity,
        "distributor_information": distributor_information,
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
    data = {"name": name}
    response = requests.post(f"{BASEURL}/categories/addcategory", json=data, headers=headers)
    
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
        return {"error": "Failed to  products", "status_code": response.status_code}


def viewproduct(prodid):
    response = requests.get(f"{BASEURL}/products/product/info/{prodid}")
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()  # Return the successful response from the API
    else:
        return {"error": "Failed to viewall products", "status_code": response.status_code}
    
def removeproduct(token, prodid):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    response = requests.delete(f"{BASEURL}/pm_products/product/delete/{prodid}", headers=headers)
    if response.status_code == 200:
        return response.json()        
    return {"error": "Failed to remove product", "status_code": response.status_code}

def addcategory_to_product(token, prodid, categid):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"category_name": categid}
    response = requests.post(f"{BASEURL}/pm_products/product/add_category/{prodid}", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to add category to product", "status_code": response.status_code}

def removecategory_from_product(token, prodid, categid):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"category_name": categid}
    response = requests.delete(f"{BASEURL}/pm_products/product/remove_category/{prodid}", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to remove category from product", "status_code": response.status_code}



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

    product1 = create_product(pm_token, "product1", "model1", "description1", 10, "distributor_information1")
    product2 = create_product(pm_token, "product2", "model2", "description2", 20, "distributor_information2")
    product3 = create_product(pm_token, "product3", "model3", "description3", 30, "distributor_information3")
    product4 = create_product(pm_token, "product4", "model4", "description4", 40, "distributor_information4")

    products = viewproducts()
    print(products) 
    # set prices to products as a sales_manager

    price1 = update_price(sm_token, product1.get("product_id"), 100)
    price2 = update_price(sm_token, product2.get("product_id"), 200)
    price3 = update_price(sm_token, product3.get("product_id"), 300)
    price4 = update_price(sm_token, product4.get("product_id"), 400)

    #view products
    print("1")

    products = viewproducts()
    print(products)

    #view categories 

    categories = viewcategories()
    print(categories)

    # create categroy
 
    category1 = addcategory(pm_token, "category1")
    category2 = addcategory(pm_token, "category2")
    category3 = addcategory(pm_token, "category3")

    categories = viewcategories()
    print(categories)
    print(5)

    # add category to product given product Id

    addcategory_to_product(pm_token, product1.get("product_id"), "category1")
    addcategory_to_product(pm_token, product1.get("product_id"), "category2")
    addcategory_to_product(pm_token, product2.get("product_id"), "category2")
    addcategory_to_product(pm_token, product2.get("product_id"), "category3")
    addcategory_to_product(pm_token, product3.get("product_id"), "category3")
    addcategory_to_product(pm_token, product3.get("product_id"),"category1")

    categories = viewcategories()
    print(categories)



    # remove category from product given product Id

    removecategory_from_product(pm_token, product1.get("product_id"), "category1")
    removecategory_from_product(pm_token, product1.get("product_id"), "category2")

    categories = viewcategories()
    print(categories)

    #remove product

    removeproduct(pm_token, product1.get("product_id"))
    removeproduct(pm_token, product2.get("product_id"))

    products = viewproducts()
    print(products)



    #view products given category 
    print(category1.get("category_id")[0])
    products = viewproducts_by_category(category1.get("category_id")[0])
    print(products)

    
    #view product info 

    product = viewproduct(product3.get("product_id"))
    print(product)







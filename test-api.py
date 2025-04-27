import requests
import json

from apifunctions import register_user, login, create_product, update_price, add_to_cart, view_cart

BASE_URL = "http://localhost:5001"
HEADERS = {"Content-Type": "application/json"}

if __name__ == "__main__":
    log = []
    
    # # Register users
    log.append(register_user("Customer", "customer@example.com", "password", "customer"))
    log.append(register_user("Product Manager", "pm@example.com", "password", "product_manager", company_id=1))
    log.append(register_user("Sales Manager", "sm@example.com", "password", "sales_manager", company_id=1))
    
    # Login users
    pm_login = login("pm@example.com", "password")
    sm_login = login("sm@example.com", "password")
    customer_login = login("customer@example.com", "password")
    
    # Ensure login success
    pm_token = pm_login.get("access_token")
    sm_token = sm_login.get("access_token")
    customer_token = customer_login.get("access_token")

    product_response = create_product(pm_token, "Laptop", "X123", "Powerful laptop", 10, "Distributor A", ["Electronics"])
    log.append(product_response)
    product_id = product_response.get("product_id")
    
    if product_id:
        # Sales manager assigns a price
        log.append(update_price(sm_token, product_id, 1500))
        
        # Customer adds product to cart
        log.append(add_to_cart(customer_token, product_id, 1))
        
        # View shopping cart
        log.append(view_cart(customer_token))

    # Print log
    print(json.dumps(log, indent=4))
    

from config import BASEURL , HEADERS
import requests
import json

from auth_test import login, register_user

from product_test import create_product, update_price, addcategory_to_product


# register users
# 


# 1- customer
# 2- product manager
# 3- sales manager

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

# create products

products = [
    ("The Catcher in the Rye", "JD-001", "A novel about teenage rebellion.", 15, "Penguin Books", "J.D. Salinger", ["Classic", "Fiction"]),
    ("To Kill a Mockingbird", "TK-002", "A novel about racial injustice.", 20, "HarperCollins", "Harper Lee", ["Classic", "Drama"]),
    ("1984", "OR-003", "A dystopian novel about surveillance.", 25, "Secker & Warburg", "George Orwell", ["Dystopian", "Science Fiction"]),
    ("Moby-Dick", "MD-004", "A novel about a man's obsession with a whale.", 30, "Harper & Brothers", "Herman Melville", ["Classic", "Adventure"]),
    ("Pride and Prejudice", "PP-005", "A classic romance novel.", 18, "T. Egerton", "Jane Austen", ["Romance", "Classic"]),
    ("The Great Gatsby", "GG-006", "A novel about the American dream.", 22, "Scribner", "F. Scott Fitzgerald", ["Classic", "Drama"]),
    ("War and Peace", "WP-007", "A historical novel set in Russia.", 40, "The Russian Messenger", "Leo Tolstoy", ["Historical", "Classic"]),
    ("Crime and Punishment", "CP-008", "A psychological novel about guilt.", 28, "The Russian Messenger", "Fyodor Dostoevsky", ["Classic", "Psychological"]),
    ("Brave New World", "BN-009", "A dystopian novel about a controlled society.", 25, "Chatto & Windus", "Aldous Huxley", ["Dystopian", "Science Fiction"]),
    ("The Hobbit", "TH-010", "A fantasy novel about a journey.", 20, "George Allen & Unwin", "J.R.R. Tolkien", ["Fantasy", "Adventure"]),
    ("Fahrenheit 451", "F451-011", "A novel about book burning.", 18, "Ballantine Books", "Ray Bradbury", ["Dystopian", "Science Fiction"]),
    ("The Odyssey", "O-012", "An epic poem about a hero's journey.", 35, "Ancient Greece", "Homer", ["Classic", "Epic"]),
    ("The Iliad", "I-013", "An epic poem about the Trojan War.", 35, "Ancient Greece", "Homer", ["Classic", "Epic"]),
    ("Jane Eyre", "JE-014", "A novel about an orphaned girl's struggles.", 22, "Smith, Elder & Co.", "Charlotte Brontë", ["Classic", "Romance"]),
    ("Wuthering Heights", "WH-015", "A gothic novel about love and revenge.", 24, "Thomas Cautley Newby", "Emily Brontë", ["Classic", "Gothic"]),
    ("Frankenstein", "FR-016", "A novel about a scientist's creation.", 18, "Lackington, Hughes, Harding, Mavor & Jones", "Mary Shelley", ["Horror", "Classic"]),
    ("Dracula", "D-017", "A gothic horror novel about a vampire.", 26, "Archibald Constable and Company", "Bram Stoker", ["Horror", "Gothic"]),
    ("Les Misérables", "LM-018", "A novel about redemption and revolution.", 45, "A. Lacroix, Verboeckhoven & Cie", "Victor Hugo", ["Classic", "Historical"]),
    ("The Divine Comedy", "DC-019", "A poetic journey through the afterlife.", 50, "Italy", "Dante Alighieri", ["Classic", "Philosophy"]),
    ("Don Quixote", "DQ-020", "A satirical novel about chivalry.", 38, "Francisco de Robles", "Miguel de Cervantes", ["Classic", "Satire"]),
]

# Create book products
created_products = []
for title, model, description, stock, distributor, author, categories in products:
    product = create_product(pm_token, title, model, description, stock, distributor, author)
    created_products.append(product)
    for category in categories:
        addcategory_to_product(pm_token, product.get("product_id"), category)
        
# # Set prices to books as a sales_manager
prices = [100, 200, 150, 180, 120, 160, 250, 220, 190, 130, 140, 260, 270, 210, 230, 170, 175, 280, 300, 290]

for i, product in enumerate(created_products):
    update_price(sm_token, product.get("product_id"), prices[i])


## add categories
 

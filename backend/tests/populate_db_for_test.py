import psycopg2
from datetime import datetime, timedelta

def get_db_connection():
    conn = psycopg2.connect(
        dbname="mydatabase",
        user="admin",
        password="adminpassword",
        host="db",  # Use the service name defined in Docker Compose
        port="5432"
    )
    return conn

def populate_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Insert users
    cur.execute("""
        INSERT INTO users (name, email, password, home_address, role) VALUES
        ('John Doe', 'john@example.com', 'password', '123 Main St', 'customer'),
        ('Jane Smith', 'jane@example.com', 'password', '456 Elm St', 'sales_manager'),
        ('Alice Johnson', 'alice@example.com', 'password', '789 Oak St', 'product_manager')
    """)

    # Insert products
    cur.execute("""
        INSERT INTO products (name, model, serial_number, description, stock_quantity, price, warranty_status, distributor_information, discount) VALUES
        ('Product 1', 'Model A', 'SN123456', 'Description of Product 1', 100, 19.99, '2 years', 'Distributor 1', 0.10),
        ('Product 2', 'Model B', 'SN123457', 'Description of Product 2', 200, 29.99, '2 years', 'Distributor 2', 0.20),
        ('Product 3', 'Model C', 'SN123458', 'Description of Product 3', 300, 39.99, '2 years', 'Distributor 3', 0.00)
    """)

    # Insert categories
    cur.execute("""
        INSERT INTO categories (name) VALUES
        ('Category 1'),
        ('Category 2'),
        ('Category 3')
    """)

    # Insert productcategories
    cur.execute("""
        INSERT INTO productcategories (product_id, category_id) VALUES
        (1, 1),
        (2, 2),
        (3, 3)
    """)
  # Insert shoppingcart
    cur.execute("""
        INSERT INTO shoppingcart (user_id) VALUES
        (1),
        (2)
    """)

    # Insert shoppingcartproducts
    cur.execute("""
        INSERT INTO shoppingcartproducts (cart_id, product_id, quantity) VALUES
        (1, 1, 2),
        (1, 2, 1),
        (2, 2, 1)
    """)

    # Insert orders
    cur.execute("""
        INSERT INTO orders (user_id, total_price) VALUES
        (1, 59.97),
        (2, 29.99)
    """)

    # Insert orderitems
    cur.execute("""
        INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES
        (1, 1, 2, 19.99),
        (1, 2, 1, 29.99),
        (2, 2, 1, 29.99)
    """)

    # Insert payments
    cur.execute("""
        INSERT INTO payments (order_id, user_id, amount) VALUES
        (1, 1, 59.97),
        (2, 2, 29.99)
    """)

    # Insert reviews
    cur.execute("""
        INSERT INTO reviews (user_id, product_id, rating, comment, approved) VALUES
        (1, 1, 5, 'Great product!', TRUE),
        (2, 2, 4, 'Good value for money.', TRUE)
    """)

    # Insert wishlists
    cur.execute("""
        INSERT INTO wishlists (user_id, product_id) VALUES
        (1, 3),
        (2, 1)
    """)

    # Insert deliveries
    cur.execute("""
        INSERT INTO deliveries (order_id, product_id, user_id, quantity, total_price, delivery_address, delivered) VALUES
        (1, 1, 1, 2, 39.98, '123 Main St', TRUE),
        (1, 2, 1, 1, 29.99, '123 Main St', TRUE),
        (2, 2, 2, 1, 29.99, '456 Elm St', FALSE)
    """)

    # Insert discounts
    cur.execute("""
        INSERT INTO discounts (product_id, discount_percentage, start_date, end_date) VALUES
        (1, 0.10, '2025-01-01', '2025-12-31'),
        (2, 0.20, '2025-01-01', '2025-12-31')
    """)

    # Insert refunds
    cur.execute("""
        INSERT INTO refunds (order_id, user_id, product_id, refund_amount, status) VALUES
        (1, 1, 1, 19.99, 'requested'),
        (2, 2, 2, 29.99, 'approved')
    """)

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    populate_db()

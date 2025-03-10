import psycopg2

def get_db_connection():
    conn = psycopg2.connect(
        dbname="mydatabase",
        user="admin",
        password="adminpassword",
        host="db",  # This is incorrect inside Docker
        port="5432"
    )
    return conn

def clear_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Delete data from tables
    cur.execute("DELETE FROM refunds")
    cur.execute("DELETE FROM discounts")
    cur.execute("DELETE FROM deliveries")
    cur.execute("DELETE FROM wishlists")
    cur.execute("DELETE FROM reviews")
    cur.execute("DELETE FROM payments")
    cur.execute("DELETE FROM orderitems")
    cur.execute("DELETE FROM orders")
    cur.execute("DELETE FROM shoppingcart")
    cur.execute("DELETE FROM productcategories")
    cur.execute("DELETE FROM categories")
    cur.execute("DELETE FROM products")
    cur.execute("DELETE FROM users")

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    clear_db()


# When the shopping is done, that product should be decreased from the stock and 
# the order for delivery processing should be forwarded to the delivery department, 
# which will process the order for shipping. During order processing, an order history page
# should allow the user to view the status as: processing, in-transit, and delivered.

# view orders by userID

# CREATE TABLE orders (
#     order_id SERIAL PRIMARY KEY,
#     user_id INT,
#     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     total_price DECIMAL(10,2) NOT NULL,
#     status VARCHAR(50) CHECK (status IN ('processing', 'in-transit', 'delivered')) DEFAULT 'processing',
#     FOREIGN KEY (user_id) REFERENCES users(user_id)
# );

# CREATE TABLE orderitems (
#     order_item_id SERIAL PRIMARY KEY,
#     order_id INT,
#     product_id INT,
#     quantity INT NOT NULL,
#     price DECIMAL(10,2) NOT NULL,
#     FOREIGN KEY (order_id) REFERENCES orders(order_id),
#     FOREIGN KEY (product_id) REFERENCES products(product_id)
# );



-- schema.sql

-- Create admin user if not already created
DO
$$ 
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
      CREATE USER admin WITH PASSWORD 'adminpassword';
      GRANT ALL PRIVILEGES ON DATABASE mydatabase TO admin;
   END IF;
END
$$;

-- 10. There are three types of basic roles in this system; customers, sales managers, and product managers.
-- The product manager is also in the role of delivery department since it controls the stock.
-- The sales managers are responsible for setting the prices of the products. 
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    home_address TEXT,
    role VARCHAR(50) CHECK (role IN ('customer', 'sales_manager', 'product_manager')) NOT NULL
);


-- 9. A product should have the following properties at the very least: 
-- ID, name, model, serial number, description, quantity in stocks, price, warranty status, and distributor information
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    stock_quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    warranty_status VARCHAR(255) DEFAULT '2 years',
    distributor_information TEXT -- is this related to any of user roles -- 'product_manager'
);


CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE productcategories (
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    category_id INT REFERENCES Categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- each user has one shopping cart 
CREATE TABLE shoppingcart (
    cart_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    product_id INT,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);


-- A delivery list has the following properties: 
-- delivery ID, customer ID, product ID, quantity, total price, delivery address, 
-- and a field showing whether the delivery has been completed or not.
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('processing', 'in-transit', 'delivered')) DEFAULT 'processing',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orderitems (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT,
    product_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE wishlists (
    wishlist_id SERIAL PRIMARY KEY,
    user_id INT,
    product_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INT,
    product_id INT,
    user_id INT,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE discounts (
    discount_id SERIAL PRIMARY KEY,
    product_id INT,
    discount_percentage DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE refunds (
    refund_id SERIAL PRIMARY KEY,
    order_id INT,
    user_id INT,
    product_id INT,
    refund_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('requested', 'approved', 'rejected')) DEFAULT 'requested',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);


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

CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
);

-- based on the role of the user the user will be assigned to a company
CREATE TABLE companymanagers (
    companymanager_id SERIAL PRIMARY KEY,
    company_id INT,
    user_id INT,
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 9. A product should have the following properties at the very least: 
-- ID, name, model, serial number, description, quantity in stocks, price, warranty status, and distributor information
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY, -- serial_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),-- ciltli ciltsiz
    description TEXT,
    stock_quantity INT NOT NULL,
    price DECIMAL(10,2),
    warranty_status VARCHAR(255) DEFAULT '2 years',
    distributor_information INT, -- is this related to any of user roles -- 'product_manager'
    sales_manager INT,
    product_manager INT NOT NULL,
    waiting BOOLEAN DEFAULT TRUE, --until a price is set by a sales manager
    FOREIGN KEY (sales_manager) REFERENCES users(user_id),
    FOREIGN KEY (product_manager) REFERENCES users(user_id),
    FOREIGN KEY (distributor_information) REFERENCES companies(company_id)
);


-- New products added by the product manager should only appear after their prices have been set by a sales manager. 
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
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE shoppingcartproducts (
    cart_id INT,
    product_id INT,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES shoppingcart(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    PRIMARY KEY (cart_id, product_id)
);


-- A delivery list has the following properties: 
-- delivery ID, customer ID, product ID, quantity, total price, delivery address, 
-- and a field showing whether the delivery has been completed or not.
CREATE TABLE userorders (
    userorder_id SERIAL PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('processing', 'in-transit', 'delivered')) DEFAULT 'processing',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orderitems (
    orderitem_id SERIAL PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, --final price --if discount was applied it affected it already
    status VARCHAR(50) CHECK (status IN ('processing', 'in-transit', 'delivered')) DEFAULT 'processing',
    FOREIGN KEY (order_id) REFERENCES userorders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    
);


CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    userorder_id INT,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES userorders(order_id),
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
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE wishlistproducts (
    wishlist_id INT,
    product_id INT,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(wishlist_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    PRIMARY KEY (wishlist_id, product_id)
);

CREATE TABLE discounts (
    discount_id SERIAL PRIMARY KEY,
    product_id INT,
    discount_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE refunds (
    refund_id SERIAL PRIMARY KEY,
    orderproduct_id INT,
    user_id INT,
    product_id INT,
    refund_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('requested', 'approved', 'rejected')) DEFAULT 'requested',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderproduct_id) REFERENCES orderproducts(orderproduct_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
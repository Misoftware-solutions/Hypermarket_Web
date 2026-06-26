CREATE DATABASE IF NOT EXISTS supermarket_erp;
USE supermarket_erp;

-- MASTER TABLES
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT NULL,
    image_url VARCHAR(500) NULL,
    sort_order INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS units (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- USERS (Admin/Staff)
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    mobile VARCHAR(20),
    email VARCHAR(100),
    role_id INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150),
    mobile VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    loyalty_points DECIMAL(10,2) DEFAULT 0,
    wallet_balance DECIMAL(10,2) DEFAULT 0,
    referral_code VARCHAR(50),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_addresses (
    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    label VARCHAR(50) DEFAULT 'Home',
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    is_default BIT DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) ENGINE=InnoDB;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    slug VARCHAR(250),
    category_id INT,
    brand_id INT,
    unit_id INT,
    mrp DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    offer_price DECIMAL(10,2) NULL,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    hsn_code VARCHAR(20),
    description TEXT,
    is_featured BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    FOREIGN KEY (unit_id) REFERENCES units(unit_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    image_url VARCHAR(500),
    is_primary BIT DEFAULT 0,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    product_id BIGINT PRIMARY KEY,
    available_qty DECIMAL(10,2) DEFAULT 0,
    reserved_qty DECIMAL(10,2) DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT,
    delivery_address_id BIGINT NULL,
    order_status VARCHAR(30) DEFAULT 'Placed',
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'Pending',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) DEFAULT 0,
    delivery_slot VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    qty DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- SHOPPING CART
CREATE TABLE IF NOT EXISTS shopping_cart (
    cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shopping_cart_items (
    cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT,
    product_id BIGINT,
    qty DECIMAL(10,2),
    FOREIGN KEY (cart_id) REFERENCES shopping_cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage',
    discount_value DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2) NULL,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    valid_from DATE,
    valid_to DATE,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- BANNERS
CREATE TABLE IF NOT EXISTS banners (
    banner_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    position VARCHAR(50) DEFAULT 'home_top',
    sort_order INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- INDEXES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO roles (role_name) VALUES ('super_admin'), ('manager'), ('cashier');

INSERT INTO units (unit_name) VALUES ('kg'), ('g'), ('ltr'), ('ml'), ('pcs'), ('pack'), ('dozen');

INSERT INTO categories (category_name, sort_order) VALUES
('Fruits & Vegetables', 1), ('Dairy & Eggs', 2), ('Bakery', 3),
('Meat & Seafood', 4), ('Beverages', 5), ('Snacks', 6),
('Groceries & Staples', 7), ('Personal Care', 8), ('Household', 9);

INSERT INTO brands (brand_name) VALUES
('Farm Fresh'), ('Amul'), ('Harvest Gold'), ('India Gate'),
('Tropicana'), ('Nestle'), ('Britannia'), ('Parle'),
('Tata'), ('Haldirams'), ('MTR'), ('Aashirvaad');

INSERT INTO users (username, password_hash, full_name, mobile, email, role_id)
VALUES ('admin', '$2b$10$U3PwoJ6uj8GQc2JXIuEke.y7hwfTuOMNioE37HZWXGEdYJUZWbTGu', 'Admin User', '9876543210', 'admin@hypermarket.com', 1);

INSERT INTO customers (customer_name, mobile, email, password_hash, referral_code) VALUES
('Rahul Sharma', '9876543210', 'rahul@email.com', '$2b$10$MDR.kmSQPvaRlG.AivT2RuYBYxw1iaLjrlN3boZr1RBPd1ui1bUWW', 'RAHUL250'),
('Priya Patel', '9876543211', 'priya@email.com', '$2b$10$MDR.kmSQPvaRlG.AivT2RuYBYxw1iaLjrlN3boZr1RBPd1ui1bUWW', 'PRIYA100'),
('Amit Kumar', '9876543212', 'amit@email.com', '$2b$10$MDR.kmSQPvaRlG.AivT2RuYBYxw1iaLjrlN3boZr1RBPd1ui1bUWW', 'AMIT150');

INSERT INTO customer_addresses (customer_id, label, address_line1, city, state, pincode, is_default) VALUES
(1, 'Home', '123, MG Road, Koramangala', 'Bangalore', 'Karnataka', '560034', 1),
(1, 'Work', '456, Brigade Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', 0),
(2, 'Home', '789, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040', 1);

INSERT INTO products (product_name, slug, category_id, brand_id, unit_id, mrp, selling_price, offer_price, tax_percent, description, is_featured) VALUES
('Fresh Red Apples', 'fresh-red-apples', 1, 1, 1, 180.00, 150.00, 120.00, 5.00, 'Premium quality organic apples from Himachal. Rich in fiber and vitamins.', 1),
('Amul Taza Milk 1L', 'amul-taza-milk-1l', 2, 2, 3, 60.00, 56.00, NULL, 0.00, 'Fresh pasteurized toned milk. Rich in calcium and protein.', 1),
('Harvest Gold Bread', 'harvest-gold-bread', 3, 3, 5, 50.00, 45.00, 40.00, 5.00, 'Soft and fluffy whole wheat bread. Perfect for sandwiches.', 1),
('India Gate Basmati 5kg', 'india-gate-basmati-5kg', 7, 4, 1, 450.00, 399.00, 380.00, 5.00, 'Premium aged basmati rice. Extra long grain.', 1),
('Tropicana Orange Juice 1L', 'tropicana-orange-juice', 5, 5, 3, 120.00, 110.00, NULL, 12.00, '100% pure orange juice. No added sugar.', 1),
('Nestle Maggi 8-Pack', 'nestle-maggi-8pack', 7, 6, 5, 120.00, 104.00, 96.00, 18.00, 'Instant noodles family pack. Ready in 2 minutes.', 1),
('Britannia Good Day', 'britannia-good-day', 6, 7, 5, 35.00, 30.00, NULL, 18.00, 'Butter cookies with rich buttery taste.', 0),
('Parle-G Biscuits', 'parle-g-biscuits', 6, 8, 5, 10.00, 10.00, NULL, 18.00, 'Gluco biscuits. India\'s most loved biscuit.', 0),
('Tata Salt 1kg', 'tata-salt-1kg', 7, 9, 1, 28.00, 24.00, NULL, 0.00, 'Iodized vacuum evaporated salt.', 0),
('Haldirams Aloo Bhujia', 'haldirams-aloo-bhujia', 6, 10, 5, 80.00, 72.00, 65.00, 12.00, 'Crispy potato noodles. Classic Indian snack.', 1),
('MTR Rava Idli Mix', 'mtr-rava-idli-mix', 7, 11, 5, 65.00, 58.00, NULL, 18.00, 'Instant rava idli mix. Ready in minutes.', 0),
('Aashirvaad Atta 10kg', 'aashirvaad-atta-10kg', 7, 12, 1, 480.00, 430.00, 410.00, 0.00, 'Whole wheat flour. Soft rotis every time.', 1);

INSERT INTO inventory (product_id, available_qty, low_stock_threshold) VALUES
(1, 50, 10), (2, 200, 30), (3, 80, 15), (4, 120, 20),
(5, 60, 10), (6, 150, 25), (7, 90, 15), (8, 300, 50),
(9, 250, 40), (10, 70, 10), (11, 45, 10), (12, 100, 15);

INSERT INTO banners (title, image_url, link_url, position, sort_order) VALUES
('Fresh Groceries Delivered', '/banners/banner1.jpg', '/products?category=1', 'home_top', 1),
('Dairy Deals - Up to 30% Off', '/banners/banner2.jpg', '/products?category=2', 'home_top', 2),
('Weekend Special Offers', '/banners/banner3.jpg', '/products', 'home_top', 3);

INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_to) VALUES
('WELCOME50', 'percentage', 50, 200, 150, 1000, '2026-01-01', '2026-12-31'),
('FLAT100', 'flat', 100, 500, 100, 500, '2026-01-01', '2026-12-31');

INSERT INTO orders (order_number, customer_id, order_status, payment_method, payment_status, subtotal, tax_amount, delivery_charge, grand_total) VALUES
('ORD-1001', 1, 'Delivered', 'Online', 'Paid', 420.00, 21.00, 0, 441.00),
('ORD-1002', 2, 'Packed', 'COD', 'Pending', 1180.00, 60.00, 0, 1240.00),
('ORD-1003', 3, 'Placed', 'Online', 'Paid', 840.00, 50.00, 0, 890.00);

INSERT INTO order_items (order_id, product_id, qty, unit_price, total_amount) VALUES
(1, 1, 2, 120.00, 240.00), (1, 2, 1, 56.00, 56.00), (1, 3, 3, 40.00, 120.00),
(2, 4, 2, 380.00, 760.00), (2, 5, 2, 110.00, 220.00), (2, 6, 2, 96.00, 192.00),
(3, 10, 3, 65.00, 195.00), (3, 12, 1, 410.00, 410.00), (3, 7, 5, 30.00, 150.00);

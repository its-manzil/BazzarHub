Using Sql as database, and below are the command used while creating database and table for BazzaHub:

-- Create Database
CREATE DATABASE IF NOT EXISTS BazzarHub;
USE BazzarHub;

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Items Table
CREATE TABLE IF NOT EXISTS items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    marked_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    size VARCHAR(50),
    stock_remaining INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (selling_price <= marked_price)
);

-- Create Item Images Table (for multiple images)
CREATE TABLE IF NOT EXISTS item_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Optional: Create Indexes for faster queries
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_items_brand ON items(brand);
CREATE INDEX idx_items_price ON items(selling_price);

-- Orders Table (for future expansion)
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- Categories Table (for product organization)
CREATE TABLE IF NOT EXISTS categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id INT DEFAULT NULL
);

-- Item-Category Mapping Table
CREATE TABLE IF NOT EXISTS item_category_mapping (
    item_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (item_id, category_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);


-- Database Updated in May 28:
-- Update Items Table
ALTER TABLE items 
DROP COLUMN size,
DROP COLUMN stock_remaining;

-- Create Product Table (replaces items)
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Product Variants Table (for size/color/etc variations)
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    variant_value VARCHAR(100) NOT NULL, -- e.g., "XL", "Red"
    marked_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CHECK (selling_price <= marked_price)
);

ALTER TABLE item_images DROP FOREIGN KEY item_images_ibfk_1;
ALTER TABLE item_images 
    CHANGE COLUMN item_id product_id INT NOT NULL,
    ALGORITHM=INPLACE;
ALTER TABLE item_images 
    ADD CONSTRAINT fk_product_images
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;

ALTER TABLE products ADD category VARCHAR(255) DEFAULT 'Uncategorized';


-- New tables created Date 31 May
-- Create product ratings table
CREATE TABLE IF NOT EXISTS product_ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY (product_id, user_id) -- Each user can only rate a product once
);

-- Create product comments table
CREATE TABLE IF NOT EXISTS product_comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create comment images table
CREATE TABLE IF NOT EXISTS comment_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    comment_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES product_comments(comment_id) ON DELETE CASCADE
);
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


use "npm install" to install all packages needed in react as well as server side.
-- Hotel Relax Restaurant Database Setup
-- Run this script in MySQL to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS hotel_relax;
USE hotel_relax;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_time TIMESTAMP NULL,
  notes TEXT,
  INDEX idx_status (status),
  INDEX idx_order_time (order_time)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_size VARCHAR(50) DEFAULT 'Regular',
  item_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  item_added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (item_price * quantity) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_item_added_time (item_added_time)
);

-- Create customers table (for future use)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
);

-- Create menu_items table (for future use)
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price_regular DECIMAL(10,2),
  price_half DECIMAL(10,2),
  price_full DECIMAL(10,2),
  price_90ml DECIMAL(10,2),
  price_180ml DECIMAL(10,2),
  price_330ml DECIMAL(10,2),
  price_650ml DECIMAL(10,2),
  price_375ml DECIMAL(10,2),
  price_750ml DECIMAL(10,2),
  image_url VARCHAR(500),
  is_popular BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_available (is_available)
);

-- Insert sample data (optional)
-- INSERT INTO orders (customer_name, customer_phone, total_amount, status) VALUES
-- ('Walk-in Customer', 'N/A', 250.00, 'pending');

-- Sample query to view recent orders
-- SELECT 
--   o.id,
--   o.customer_name,
--   o.customer_phone,
--   o.total_amount,
--   o.status,
--   o.order_time,
--   COUNT(oi.id) as item_count
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- GROUP BY o.id
-- ORDER BY o.order_time DESC;

-- Sample query to view order details
-- SELECT 
--   o.*,
--   oi.item_name,
--   oi.item_size,
--   oi.item_price,
--   oi.quantity,
--   oi.subtotal
-- FROM orders o
-- JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.id = 1;

-- ==========================================================
-- iPOS System Database Initialization Script
-- Please run this script using a user with CREATE TABLE privileges
-- Example: mysql -h 103.1.235.47 -P 19789 -u root -p production_db < init.sql
-- ==========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed defaults for products (use fixed UUIDs so they can be re-inserted consistently)
INSERT IGNORE INTO products (id, name, imagePath, price, stock, unit) VALUES 
('11111111-0001-0001-0001-000000000001', 'ເບຍນ້ຳຂອງ 3 ກະປ໋ອງ', 'assets/images/beer_cans.png', 75000, 1607, 'Pack'),
('11111111-0001-0001-0001-000000000002', 'ເບยນ້ຳຂອງ 12 ກະປ໋ອງ', 'assets/images/beer_box.png', 270000, 593, 'Pack'),
('11111111-0001-0001-0001-000000000003', 'ເບຍນ້ຳຂອງ 1 ແທັດ', 'assets/images/beer_box.png', 500000, 656, 'ແທັດ'),
('11111111-0001-0001-0001-000000000004', 'ນ້ຳດື່ມ', 'assets/images/water_bottle.png', 10000, 506, 'ຕຸກ'),
('11111111-0001-0001-0001-000000000005', 'ຈອກ', 'assets/images/blue_cups.png', 10000, 254, 'Pack'),
('11111111-0001-0001-0001-000000000006', 'ນ້ຳກ້ອນ', 'assets/images/ice_bag.png', 20000, 871, 'ຖົງ');


-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  date DATETIME NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50),
  currency VARCHAR(10),
  paymentMethod VARCHAR(50),
  itemsJson JSON,
  amountReceived DECIMAL(15, 2),
  changeAmount DECIMAL(15, 2),
  remark TEXT,
  user_id VARCHAR(36),
  syncedAt DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'staff',
  lastLogin VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial Users (with fixed UUIDs)
INSERT IGNORE INTO users (id, name, email, password, role, lastLogin) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin User', 'admin@ipos.com', '123', 'admin', ''),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cashier One', 'cashier1@ipos.com', '123', 'staff', ''),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cashier Two', 'cashier2@ipos.com', '123', 'staff', '');


-- 4. Create Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
  currency VARCHAR(10) PRIMARY KEY,
  rate DECIMAL(15, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed defaults for exchange rates
INSERT IGNORE INTO exchange_rates (currency, rate) VALUES 
('LAK', 1),
('THB', 740.0),
('USD', 21500.0);

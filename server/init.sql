-- ==========================================================
-- iPOS System Database Initialization Script
-- Please run this script using a user with CREATE TABLE privileges
-- Example: mysql -h 103.1.235.47 -P 19789 -u root -p ipos < init.sql
-- ==========================================================

-- 1. Create Shops Table
CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial Shops
INSERT IGNORE INTO shops (id, name, address, phone) VALUES 
('s1111111-1111-1111-1111-111111111111', 'Namkhong Beer Vientiane', 'Vientiane Capital', '020 12345678'),
('s2222222-2222-2222-2222-222222222222', 'Namkhong Beer Pakse', 'Champasak Province', '020 87654321');

-- 2. Create Products Table (Updated with shop_id)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shop_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 3. Create Users Table (Updated with shop_id)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shop_id VARCHAR(36),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'staff',
  lastLogin VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL
);

-- Seed initial Users
INSERT IGNORE INTO users (id, shop_id, name, email, password, role, lastLogin) VALUES 
('00000000-0000-0000-0000-000000000000', NULL, 'System Admin', 'system@ipos.com', 'admin123', 'admin', ''),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 's1111111-1111-1111-1111-111111111111', 'Admin User', 'admin@ipos.com', '123', 'admin', ''),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's1111111-1111-1111-1111-111111111111', 'Cashier One', 'cashier1@ipos.com', '123', 'staff', ''),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 's2222222-2222-2222-2222-222222222222', 'Cashier Two', 'cashier2@ipos.com', '123', 'staff', '');

-- 4. Create Orders Table (Updated with shop_id)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  shop_id VARCHAR(36),
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
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create Exchange Rates Table
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

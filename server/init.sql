-- ==========================================================
-- iPOS System Database Initialization Script
-- Multi-Shop Architecture Version
-- ==========================================================

USE ipos;

-- 1. Create Shops Table
CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  owner_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  logoPath VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shop_id VARCHAR(36),
  owner_id VARCHAR(36),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'staff',
  lastLogin VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2.1 Junction table for Users and Shops (Multi-shop assignment)
CREATE TABLE IF NOT EXISTS user_shops (
  user_id VARCHAR(36),
  shop_id VARCHAR(36),
  PRIMARY KEY (user_id, shop_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- Add Foreign Key to shops after users table is created
ALTER TABLE shops ADD CONSTRAINT fk_shop_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shop_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255),
  price DECIMAL(15, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 4. Create Orders Table
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
  currency VARCHAR(10) NOT NULL,
  shop_id VARCHAR(255) NOT NULL DEFAULT 'global',
  rate DECIMAL(15, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (currency, shop_id)
);

-- Seed System Administrator
INSERT IGNORE INTO users (id, shop_id, name, email, password, role) VALUES 
('00000000-0000-0000-0000-000000000000', NULL, 'System Admin', 'system@ipos.com', 'admin123', 'admin');

-- Seed Default Exchange Rates
INSERT IGNORE INTO exchange_rates (currency, shop_id, rate) VALUES 
('LAK', 'global', 1),
('THB', 'global', 740.0),
('USD', 'global', 21500.0);

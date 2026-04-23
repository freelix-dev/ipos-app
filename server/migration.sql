-- ==========================================================
-- iPOS System Database Migration Script
-- Run this as ROOT to update your existing database to Multi-Shop
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

-- 2. Seed initial Shops (Example)
INSERT IGNORE INTO shops (id, name, address, phone) VALUES 
('s1111111-1111-1111-1111-111111111111', 'Namkhong Beer Vientiane', 'Vientiane Capital', '020 12345678'),
('s2222222-2222-2222-2222-222222222222', 'Namkhong Beer Pakse', 'Champasak Province', '020 87654321');

-- 3. Add shop_id to Users
ALTER TABLE users ADD COLUMN shop_id VARCHAR(36) AFTER id;
ALTER TABLE users ADD CONSTRAINT fk_user_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;

-- 4. Add shop_id to Products
ALTER TABLE products ADD COLUMN shop_id VARCHAR(36) AFTER id;
ALTER TABLE products ADD CONSTRAINT fk_product_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;

-- 5. Add shop_id to Orders
ALTER TABLE orders ADD COLUMN shop_id VARCHAR(36) AFTER id;
ALTER TABLE orders ADD CONSTRAINT fk_order_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;

-- 6. Assign existing data to the default shop (Vientiane)
UPDATE users SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL;
UPDATE products SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL;
UPDATE orders SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL;

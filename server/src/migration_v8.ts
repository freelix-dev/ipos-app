import { writePool } from './db';

export const up = async () => {
  // 1. Promotions Table
  await writePool.query(`
    CREATE TABLE IF NOT EXISTS promotions (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      shop_id VARCHAR(36),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type ENUM('fixed', 'percentage', 'bogo') NOT NULL,
      value DECIMAL(15, 2) DEFAULT 0,
      min_spend DECIMAL(15, 2) DEFAULT 0,
      start_date DATETIME,
      end_date DATETIME,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  // 2. Coupons Table
  await writePool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      shop_id VARCHAR(36),
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type ENUM('fixed', 'percentage') NOT NULL,
      discount_value DECIMAL(15, 2) NOT NULL,
      min_purchase DECIMAL(15, 2) DEFAULT 0,
      usage_limit INT DEFAULT 100,
      used_count INT DEFAULT 0,
      expiry_date DATETIME,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  console.log('Marketing tables created successfully');
};

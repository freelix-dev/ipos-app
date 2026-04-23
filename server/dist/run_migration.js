"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const runMigration = async () => {
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST_WRITE,
        port: parseInt(process.env.DB_PORT_WRITE || '3306', 10),
        user: process.env.DB_USER_WRITE,
        password: process.env.DB_PASSWORD_WRITE,
        database: process.env.DB_DATABASE_WRITE,
    });
    console.log('Connecting to database...');
    try {
        // 1. Create Shops Table
        console.log('Creating shops table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        // 2. Seed initial Shops
        console.log('Seeding initial shops...');
        await connection.query(`
      INSERT IGNORE INTO shops (id, name, address, phone) VALUES 
      ('s1111111-1111-1111-1111-111111111111', 'Namkhong Beer Vientiane', 'Vientiane Capital', '020 12345678'),
      ('s2222222-2222-2222-2222-222222222222', 'Namkhong Beer Pakse', 'Champasak Province', '020 87654321')
    `);
        // 3. Update Users Table
        console.log('Updating users table...');
        try {
            await connection.query('ALTER TABLE users ADD COLUMN shop_id VARCHAR(36) AFTER id');
            await connection.query('ALTER TABLE users ADD CONSTRAINT fk_user_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL');
        }
        catch (e) {
            console.log('Column shop_id might already exist in users.');
        }
        // 4. Update Products Table
        console.log('Updating products table...');
        try {
            await connection.query('ALTER TABLE products ADD COLUMN shop_id VARCHAR(36) AFTER id');
            await connection.query('ALTER TABLE products ADD CONSTRAINT fk_product_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE');
        }
        catch (e) {
            console.log('Column shop_id might already exist in products.');
        }
        // 5. Update Orders Table
        console.log('Updating orders table...');
        try {
            await connection.query('ALTER TABLE orders ADD COLUMN shop_id VARCHAR(36) AFTER id');
            await connection.query('ALTER TABLE orders ADD CONSTRAINT fk_order_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL');
        }
        catch (e) {
            console.log('Column shop_id might already exist in orders.');
        }
        // 6. Assign Defaults
        console.log('Assigning default shop to existing data...');
        await connection.query("UPDATE users SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL");
        await connection.query("UPDATE products SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL");
        await connection.query("UPDATE orders SET shop_id = 's1111111-1111-1111-1111-111111111111' WHERE shop_id IS NULL");
        console.log('Migration COMPLETED successfully!');
    }
    catch (error) {
        console.error('Migration FAILED:', error);
    }
    finally {
        await connection.end();
    }
};
runMigration();

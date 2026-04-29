"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const runMigration = async () => {
    console.log('Connecting to database via writePool for Migration V2...');
    let connection;
    try {
        connection = await db_1.writePool.getConnection();
        // 1. Audit Logs Table
        console.log('Creating audit_logs table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36),
        shop_id VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(36),
        details TEXT,
        ip_address VARCHAR(45),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_shop (shop_id),
        INDEX idx_created (created_at)
      )
    `);
        // 2. Suppliers Table
        console.log('Creating suppliers table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        shop_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_shop (shop_id)
      )
    `);
        // 3. System Settings Table
        console.log('Creating system_settings table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        // Seed default settings
        console.log('Seeding default system settings...');
        await connection.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
      ('app_name', 'iPOS PRO', 'The name of the application'),
      ('currency_primary', 'LAK', 'Primary currency code'),
      ('tax_rate', '0', 'Default tax rate percentage'),
      ('allow_negative_stock', 'false', 'Whether to allow sales when stock is zero')
    `);
        console.log('Migration V2 COMPLETED successfully!');
    }
    catch (error) {
        console.error('Migration V2 FAILED:', error);
    }
    finally {
        if (connection)
            connection.release();
        process.exit(0);
    }
};
runMigration();

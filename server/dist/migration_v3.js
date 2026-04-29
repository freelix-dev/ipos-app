"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const runMigration = async () => {
    console.log('Connecting to database for Migration V3 (Receipt & Dashboard)...');
    let connection;
    try {
        connection = await db_1.writePool.getConnection();
        // 1. Receipt Settings Table
        console.log('Creating receipt_settings table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS receipt_settings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        shop_id VARCHAR(36) UNIQUE,
        logo_enabled BOOLEAN DEFAULT TRUE,
        header_text TEXT,
        footer_text TEXT,
        show_phone BOOLEAN DEFAULT TRUE,
        show_address BOOLEAN DEFAULT TRUE,
        show_order_id BOOLEAN DEFAULT TRUE,
        show_staff_name BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_receipt_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);
        // Seed default receipt settings for existing shops
        console.log('Seeding default receipt settings...');
        await connection.query(`
      INSERT IGNORE INTO receipt_settings (shop_id, header_text, footer_text)
      SELECT id, 'Welcome to ' || name, 'Thank you for your purchase!' FROM shops
    `);
        console.log('Migration V3 COMPLETED successfully!');
    }
    catch (error) {
        console.error('Migration V3 FAILED:', error);
    }
    finally {
        if (connection)
            connection.release();
        process.exit(0);
    }
};
runMigration();

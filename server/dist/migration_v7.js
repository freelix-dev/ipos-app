"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const runMigration = async () => {
    console.log('Connecting to database for Migration V7 (Void, Expense, Stock History)...');
    let connection;
    try {
        connection = await db_1.writePool.getConnection();
        // 1. Update Orders Table for Voiding
        const orderCols = [
            { name: 'void_reason', type: 'TEXT', after: 'status' },
            { name: 'voided_at', type: 'DATETIME', after: 'void_reason' },
            { name: 'voided_by', type: 'VARCHAR(36)', after: 'voided_at' }
        ];
        for (const col of orderCols) {
            try {
                await connection.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
                console.log(`Column ${col.name} added to orders.`);
            }
            catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME')
                    console.log(`Column ${col.name} exists in orders.`);
                else
                    throw err;
            }
        }
        // 2. Create Expenses Table
        console.log('Creating expenses table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        shop_id VARCHAR(36) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        CONSTRAINT fk_expense_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);
        // 3. Create Stock History Table
        console.log('Creating stock_history table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_history (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        product_id VARCHAR(36) NOT NULL,
        shop_id VARCHAR(36) NOT NULL,
        change_amount INT NOT NULL,
        type ENUM('Sale', 'Restock', 'Adjustment', 'Void') NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
        console.log('Migration V7 COMPLETED successfully!');
    }
    catch (error) {
        console.error('Migration V7 FAILED:', error);
    }
    finally {
        if (connection)
            connection.release();
        process.exit(0);
    }
};
runMigration();

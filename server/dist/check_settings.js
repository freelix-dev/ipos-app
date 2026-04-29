"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function checkSettings() {
    try {
        const [rows] = await db_1.readPool.query('SELECT * FROM system_settings');
        console.log('Current System Settings:');
        console.table(rows);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        process.exit();
    }
}
checkSettings();

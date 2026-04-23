"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function check() {
    try {
        console.log('Checking tables...');
        const [rows] = await db_1.readPool.query('SHOW TABLES');
        console.log('Tables:', rows);
        const [products] = await db_1.readPool.query('SELECT COUNT(*) as count FROM products');
        console.log('Products count:', products);
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        process.exit();
    }
}
check();
